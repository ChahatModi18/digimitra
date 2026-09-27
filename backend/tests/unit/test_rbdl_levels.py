"""Unit tests for RBDL level definitions."""

from app.domain.rbdl.rbdl_levels import RBDLLevel, get_rbdl_info


def test_rbdl_level_enum_values():
    assert RBDLLevel.LEVEL_0 == 0
    assert RBDLLevel.LEVEL_1 == 1
    assert RBDLLevel.LEVEL_2 == 2
    assert RBDLLevel.LEVEL_3 == 3


def test_get_rbdl_info_valid():
    info_0 = get_rbdl_info(0)
    assert info_0["level"] == 0
    assert "Non-Digital" in info_0["name_en"]
    assert "गैर-डिजिटल" in info_0["name_hi"]

    info_3 = get_rbdl_info(3)
    assert info_3["level"] == 3
    assert "Data-Driven" in info_3["name_en"]


def test_get_rbdl_info_fallback():
    info_invalid = get_rbdl_info(99)
    assert info_invalid["level"] == 99
    assert "Custom / Unclassified" in info_invalid["name_en"]
