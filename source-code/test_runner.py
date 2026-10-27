#!/usr/bin/env python3
"""
XTCEForge Pro (v1.0.0) — Automated Test Suite
Standards: CCSDS 660.0-B-2 (Blue Book) & OMG XTCE 1.2
Tests bit-level decommutation, polynomial calibration, alarms, command encoding, and the 10-point normative auditor.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xtce_cli import (
    BitReader,
    sign_extend,
    evaluate_polynomial,
    evaluate_alarm,
    decommutate,
    encode_command,
    generate_xtce_xml,
    audit_xtce,
    SCHEMAS
)

class TestXTCEForgePro(unittest.TestCase):

    def setUp(self):
        self.schema = SCHEMAS['eps']

    def test_01_xtce_xml_generation(self):
        """1. Test normative XTCE XML generation and schema validation."""
        xml_str = generate_xtce_xml(self.schema)
        self.assertIn('<SpaceSystem xmlns="http://www.omg.org/spec/XTCE/20180204"', xml_str)
        self.assertIn('<Header', xml_str)
        self.assertIn('<TelemetryMetaData>', xml_str)
        self.assertIn('<ParameterTypeSet>', xml_str)
        self.assertIn('<CommandMetaData>', xml_str)

    def test_02_bit_reader_unaligned(self):
        """2. Test non-byte-aligned bit extraction (12-bit fields across byte boundaries)."""
        # 3 bytes = 24 bits: two 12-bit integers: 0xABC, 0x123 -> bytes [0xAB, 0xC1, 0x23]
        data = bytes([0xAB, 0xC1, 0x23])
        reader = BitReader(data)
        val1 = reader.read_bits(12)
        val2 = reader.read_bits(12)
        self.assertEqual(val1, 0xABC)
        self.assertEqual(val2, 0x123)

    def test_03_signed_integer_sign_extension(self):
        """3. Test two's complement sign extension for signed telemetry parameters."""
        # 16-bit signed -100 is 0xFF9C
        val_unsigned = 0xFF9C
        signed_val = sign_extend(val_unsigned, 16)
        self.assertEqual(signed_val, -100)

        # Positive value remains positive
        pos_val = sign_extend(0x03E8, 16)
        self.assertEqual(pos_val, 1000)

    def test_04_polynomial_calibration(self):
        """4. Test linear and non-linear polynomial calibration math."""
        # Linear: V = 0.0 + 0.001 * raw
        raw_adc = 8000
        volts = evaluate_polynomial(raw_adc, [0.0, 0.001])
        self.assertAlmostEqual(volts, 8.0, places=4)

        # 2nd order polynomial: T = -50 + 0.05*x - 0.000002*x^2
        raw_temp = 1000
        temp_c = evaluate_polynomial(raw_temp, [-50.0, 0.05, -0.000002])
        # -50 + 50 - 2 = -2.0
        self.assertAlmostEqual(temp_c, -2.0, places=4)

    def test_05_enumeration_mapping(self):
        """5. Test state enumeration label mapping."""
        res_boot = self.schema['parameters'][3]['enumMap'][0]
        res_nom = self.schema['parameters'][3]['enumMap'][3]
        self.assertEqual(res_boot, 'BOOT')
        self.assertEqual(res_nom, 'NOMINAL')

    def test_06_alarm_limit_evaluation(self):
        """6. Test multi-tier alarm monitoring logic."""
        alarms = {'critLow': 6.5, 'warnLow': 7.0, 'warnHigh': 8.3, 'critHigh': 8.45}
        self.assertEqual(evaluate_alarm(8.0, alarms), 'NORMAL')
        self.assertEqual(evaluate_alarm(6.8, alarms), 'WARNING_LOW')
        self.assertEqual(evaluate_alarm(6.2, alarms), 'CRITICAL_LOW')
        self.assertEqual(evaluate_alarm(8.35, alarms), 'WARNING_HIGH')
        self.assertEqual(evaluate_alarm(8.50, alarms), 'CRITICAL_HIGH')

    def test_07_full_packet_decommutation(self):
        """7. Test end-to-end telemetry packet decommutation from raw hex."""
        # Sample: Batt=8.00V, Curr=+1.00A, State=NOMINAL
        hex_pkt = 'EB900120002A031F4003E8CE49E4820840A812'
        res = decommutate(self.schema, hex_pkt)

        params_by_name = {p['name']: p for p in res['parameters']}
        self.assertEqual(params_by_name['SYNC_WORD']['displayVal'], '0xEB90')
        self.assertEqual(params_by_name['PACKET_ID']['displayVal'], '0x0120')
        self.assertEqual(params_by_name['SYS_STATE']['engVal'], 'NOMINAL')
        self.assertAlmostEqual(params_by_name['BATT_VOLTAGE']['engVal'], 8.0, places=2)
        self.assertAlmostEqual(params_by_name['BATT_CURRENT']['engVal'], 1.0, places=2)
        self.assertEqual(params_by_name['BATT_VOLTAGE']['alarm'], 'NORMAL')

    def test_08_telecommand_encoding(self):
        """8. Test telecommand argument encoding into binary frame."""
        # CMD_SET_POWER_MODE opcode 0x20, targetMode 3 (NOMINAL), timeout 60s
        hex_cmd = encode_command(self.schema, 'CMD_SET_POWER_MODE', {'targetMode': 3, 'timeoutSec': 60})
        # Sync 0xEB90 (2 bytes) + Opcode 0x20 (1 byte) + Mode 0x03 (1 byte) + Timeout 0x003C (2 bytes) = 6 bytes = EB902003003C
        self.assertEqual(hex_cmd, 'EB902003003C')

    def test_09_normative_auditor_pass(self):
        """9. Test 10-point normative auditor on compliant CubeSat EPS schema."""
        xml_str = generate_xtce_xml(self.schema)
        checks = audit_xtce(self.schema, xml_str)
        self.assertEqual(len(checks), 10)
        passed_count = sum(1 for c in checks if c[2])
        self.assertEqual(passed_count, 10, f"Failed rules: {[c for c in checks if not c[2]]}")

    def test_10_normative_auditor_reject_broken_alarms(self):
        """10. Test auditor detects inverted or inconsistent alarm limits."""
        bad_schema = dict(self.schema)
        bad_schema['parameters'] = [dict(p) for p in self.schema['parameters']]
        # Invert alarm: critLow > warnLow
        bad_schema['parameters'][4]['alarms'] = {'critLow': 8.0, 'warnLow': 7.0}
        xml_str = generate_xtce_xml(bad_schema)
        checks = audit_xtce(bad_schema, xml_str)
        rule_007 = next(c for c in checks if c[0] == 'XTCE-007')
        self.assertFalse(rule_007[2])

if __name__ == '__main__':
    unittest.main()
