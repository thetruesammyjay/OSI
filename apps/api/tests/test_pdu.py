from app.services.pdu import decapsulate, encapsulate, simulate


def test_encapsulation_has_all_layers_and_data_link_trailer() -> None:
    result = encapsulate("hello")
    assert [layer["layerNumber"] for layer in result["layers"]] == [7, 6, 5, 4, 3, 2, 1]
    assert "trailer" in result["layers"][5]


def test_round_trip_recovers_payload() -> None:
    result = encapsulate("hello")
    assert decapsulate(result)["recoveredData"] == "hello"


def test_full_simulation_contains_transmission() -> None:
    result = simulate("hello")
    assert result["transmission"]["speed"] == "1 Gbps"
