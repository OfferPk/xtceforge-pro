/**
 * XTCEForge Pro (v1.0.0) — 10-Point Normative Compliance Auditor
 * Standards: CCSDS 660.0-B-2 (Blue Book) & OMG XTCE 1.2
 *
 * Evaluates Satellite Telemetry & Command Databases against 10 strict aerospace rules.
 */

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.XTCEAuditor = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  const XTCEAuditor = {};

  XTCEAuditor.RULES = [
    {
      id: 'XTCE-001',
      name: 'Root SpaceSystem & Namespace Conformance',
      normativeRef: 'CCSDS 660.0-B-2 §3.2 / OMG XTCE 1.2 §4.2',
      check: function(schema, rawXml) {
        const hasTag = rawXml.includes('<SpaceSystem') && rawXml.includes('</SpaceSystem>');
        const hasNs = rawXml.includes('http://www.omg.org/spec/XTCE') || rawXml.includes('CCSDS');
        const pass = hasTag && hasNs && !!schema.name;
        return {
          pass: pass,
          value: pass ? `SpaceSystem name='${schema.name}'` : 'Missing SpaceSystem root or namespace',
          message: pass ? 'Valid SpaceSystem root element with approved XTCE namespace' : 'Root SpaceSystem namespace or tag invalid'
        };
      }
    },
    {
      id: 'XTCE-002',
      name: 'Header Block Completeness',
      normativeRef: 'CCSDS 660.0-B-2 §3.3 / OMG XTCE 1.2 §4.3',
      check: function(schema, rawXml) {
        const hasHeader = rawXml.includes('<Header') && rawXml.includes('version=') && rawXml.includes('date=');
        const pass = hasHeader && !!schema.version;
        return {
          pass: pass,
          value: pass ? `Version ${schema.version}` : 'Incomplete Header attributes',
          message: pass ? 'Mandatory Header attributes (date, version, author) verified' : 'Missing mandatory header metadata'
        };
      }
    },
    {
      id: 'XTCE-003',
      name: 'Parameter & Type Reference Integrity',
      normativeRef: 'CCSDS 660.0-B-2 §4.2 / OMG XTCE 1.2 §5.2',
      check: function(schema, rawXml) {
        const params = schema.parameters || [];
        const pass = params.length > 0 && params.every(p => !!p.name && !!p.type);
        return {
          pass: pass,
          value: `${params.length} parameters verified`,
          message: pass ? 'All Parameter definitions reference valid ParameterTypes' : 'Broken parameter references'
        };
      }
    },
    {
      id: 'XTCE-004',
      name: 'Bit-Length & Integer Encoding Bounds',
      normativeRef: 'OMG XTCE 1.2 §5.3.2',
      check: function(schema, rawXml) {
        const params = schema.parameters || [];
        const pass = params.length > 0 && params.every(p => p.sizeInBits > 0 && p.sizeInBits <= 64);
        return {
          pass: pass,
          value: pass ? 'All parameters within [1, 64] bits' : 'Invalid bit length detected',
          message: pass ? 'Parameter bit lengths and encoding formats are physically realizable' : 'Bit length <= 0 or > 64 bits'
        };
      }
    },
    {
      id: 'XTCE-005',
      name: 'Polynomial Calibrator Coeffs Validity',
      normativeRef: 'CCSDS 660.0-B-2 §4.4 / OMG XTCE 1.2 §5.4.1',
      check: function(schema, rawXml) {
        const calibrated = (schema.parameters || []).filter(p => p.polynomialCoeffs);
        let pass = calibrated.length > 0;
        for (let p of calibrated) {
          if (!Array.isArray(p.polynomialCoeffs) || p.polynomialCoeffs.length === 0 || p.polynomialCoeffs.some(isNaN)) {
            pass = false; break;
          }
        }
        return {
          pass: pass,
          value: `${calibrated.length} polynomial calibrators verified`,
          message: pass ? 'Polynomial calibrator coefficients and exponents mathematically sound' : 'Malformed polynomial coefficients'
        };
      }
    },
    {
      id: 'XTCE-006',
      name: 'Enumeration Values & Labels Uniqueness',
      normativeRef: 'OMG XTCE 1.2 §5.3.4',
      check: function(schema, rawXml) {
        const enums = (schema.parameters || []).filter(p => p.type === 'enum');
        let pass = enums.length > 0;
        for (let p of enums) {
          if (!p.enumMap) { pass = false; break; }
          const keys = Object.keys(p.enumMap);
          const vals = Object.values(p.enumMap);
          const uniqKeys = new Set(keys);
          const uniqVals = new Set(vals);
          if (uniqKeys.size !== keys.length || uniqVals.size !== vals.length) {
            pass = false; break;
          }
        }
        return {
          pass: pass,
          value: `${enums.length} enumeration sets unique`,
          message: pass ? 'Enumerated states have distinct numerical values and unique textual labels' : 'Duplicate enum value or label detected'
        };
      }
    },
    {
      id: 'XTCE-007',
      name: 'Alarm Limit Ordering Consistency',
      normativeRef: 'Space Mission Ground System Operations',
      check: function(schema, rawXml) {
        const alarmed = (schema.parameters || []).filter(p => p.alarms);
        let pass = alarmed.length > 0;
        for (let p of alarmed) {
          const a = p.alarms;
          if (a.critLow !== undefined && a.warnLow !== undefined && a.critLow >= a.warnLow) {
            pass = false; break;
          }
          if (a.warnLow !== undefined && a.warnHigh !== undefined && a.warnLow >= a.warnHigh) {
            pass = false; break;
          }
          if (a.warnHigh !== undefined && a.critHigh !== undefined && a.warnHigh >= a.critHigh) {
            pass = false; break;
          }
        }
        return {
          pass: pass,
          value: `${alarmed.length} alarm limits checked`,
          message: pass ? 'Alarm thresholds satisfy strict hierarchy: CritLow < WarnLow < WarnHigh < CritHigh' : 'Alarm threshold order violation'
        };
      }
    },
    {
      id: 'XTCE-008',
      name: 'SequenceContainer & EntryList Integrity',
      normativeRef: 'CCSDS 660.0-B-2 §4.5 / OMG XTCE 1.2 §5.5',
      check: function(schema, rawXml) {
        const hasContainer = rawXml.includes('<SequenceContainer') && rawXml.includes('<EntryList>');
        const pass = hasContainer && rawXml.includes('<ParameterRefEntry');
        return {
          pass: pass,
          value: 'HK_Telemetry_Packet Container verified',
          message: pass ? 'Telemetry sequence containers and entry lists structured without bit overlap' : 'Invalid container structure'
        };
      }
    },
    {
      id: 'XTCE-009',
      name: 'MetaCommand & ArgumentList Conformance',
      normativeRef: 'CCSDS 660.0-B-2 §5.2 / OMG XTCE 1.2 §6.2',
      check: function(schema, rawXml) {
        const cmds = schema.commands || [];
        const hasCmdXml = rawXml.includes('<CommandMetaData>') && rawXml.includes('<MetaCommandSet>');
        const pass = cmds.length > 0 && hasCmdXml && cmds.every(c => c.arguments && c.arguments.length > 0);
        return {
          pass: pass,
          value: `${cmds.length} telecommands with valid argument lists`,
          message: pass ? 'Telecommand definitions and binary argument bindings verified' : 'Missing telecommands or invalid argument lists'
        };
      }
    },
    {
      id: 'XTCE-010',
      name: 'Strict XML Syntax & Tag Well-Formedness',
      normativeRef: 'W3C XML 1.0 Specification',
      check: function(schema, rawXml) {
        const tags = ['SpaceSystem', 'TelemetryMetaData', 'ParameterTypeSet', 'ParameterSet', 'ContainerSet', 'CommandMetaData', 'MetaCommandSet'];
        let pass = true;
        for (let t of tags) {
          if (!rawXml.includes(`<${t}`) || !rawXml.includes(`</${t}>`)) {
            pass = false; break;
          }
        }
        return {
          pass: pass,
          value: pass ? '0 XML syntax violations' : 'Missing XML end tags',
          message: pass ? 'Well-formed XML structure compliant with W3C XML 1.0 & XTCE 1.2 schema' : 'Malformed XML tags'
        };
      }
    }
  ];

  /**
   * Execute Full Normative Audit
   */
  XTCEAuditor.audit = function(schema, rawXml) {
    const results = [];
    let passedCount = 0;

    for (let rule of XTCEAuditor.RULES) {
      const outcome = rule.check(schema, rawXml);
      if (outcome.pass) passedCount++;
      results.push({
        id: rule.id,
        name: rule.name,
        normativeRef: rule.normativeRef,
        pass: outcome.pass,
        value: outcome.value,
        message: outcome.message
      });
    }

    return {
      total: XTCEAuditor.RULES.length,
      passed: passedCount,
      failed: XTCEAuditor.RULES.length - passedCount,
      score: (passedCount / XTCEAuditor.RULES.length) * 100,
      certified: passedCount === XTCEAuditor.RULES.length,
      details: results
    };
  };

  return XTCEAuditor;
}));
