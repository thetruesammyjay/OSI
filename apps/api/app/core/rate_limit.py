from collections import defaultdict, deque
from logging import getLogger
from threading import Lock
from time import monotonic
from typing import Protocol, cast

from redis import Redis
from redis.exceptions import RedisError

from app.core.config import get_settings

logger = getLogger(__name__)


class RateLimiter(Protocol):
    def allow(self, key: str) -> bool: ...

    def reset(self, key: str) -> None: ...


class InMemoryRateLimiter:
    """Fallback limiter for local development and Redis outages."""

    def __init__(self, limit: int, window_seconds: int) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self._events: defaultdict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def allow(self, key: str) -> bool:
        now = monotonic()
        with self._lock:
            events = self._events[key]
            while events and now - events[0] >= self.window_seconds:
                events.popleft()
            if len(events) >= self.limit:
                return False
            events.append(now)
            return True

    def reset(self, key: str) -> None:
        with self._lock:
            self._events.pop(key, None)


class RedisRateLimiter:
    """Atomic fixed-window limiter shared by all API workers."""

    _INCREMENT_SCRIPT = """
    local count = redis.call('INCR', KEYS[1])
    if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
    return count
    """

    def __init__(self, redis_url: str, limit: int, window_seconds: int) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self.client: Redis = Redis.from_url(redis_url, decode_responses=True)
        self.fallback = InMemoryRateLimiter(limit, window_seconds)

    def allow(self, key: str) -> bool:
        redis_key = f"osi:rate-limit:{self.limit}:{self.window_seconds}:{key}"
        try:
            count = self.client.eval(self._INCREMENT_SCRIPT, 1, redis_key, str(self.window_seconds))
            return int(cast(str | int, count)) <= self.limit
        except RedisError:
            logger.exception("Redis rate limiter unavailable; using local fallback")
            return self.fallback.allow(key)

    def reset(self, key: str) -> None:
        redis_key = f"osi:rate-limit:{self.limit}:{self.window_seconds}:{key}"
        try:
            self.client.delete(redis_key)
        except RedisError:
            logger.exception("Redis rate limiter reset failed")
        self.fallback.reset(key)


def _build_limiter(limit: int, window_seconds: int) -> RateLimiter:
    settings = get_settings()
    if settings.rate_limit_backend == "redis" or (
        settings.rate_limit_backend == "auto" and settings.redis_url
    ):
        if settings.redis_url:
            return RedisRateLimiter(settings.redis_url, limit, window_seconds)
        raise ValueError("REDIS_URL is required for the Redis rate-limit backend")
    return InMemoryRateLimiter(limit, window_seconds)


login_limiter = _build_limiter(limit=5, window_seconds=15 * 60)
feedback_limiter = _build_limiter(limit=20, window_seconds=60 * 60)
