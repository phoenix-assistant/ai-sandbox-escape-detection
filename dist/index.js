"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessDetector = exports.NetworkDetector = exports.FilesystemDetector = exports.generateDefaultConfig = exports.loadRules = exports.Alerter = exports.SandboxMonitor = void 0;
var monitor_1 = require("./monitor");
Object.defineProperty(exports, "SandboxMonitor", { enumerable: true, get: function () { return monitor_1.SandboxMonitor; } });
var alerter_1 = require("./alerter");
Object.defineProperty(exports, "Alerter", { enumerable: true, get: function () { return alerter_1.Alerter; } });
var rules_1 = require("./rules");
Object.defineProperty(exports, "loadRules", { enumerable: true, get: function () { return rules_1.loadRules; } });
Object.defineProperty(exports, "generateDefaultConfig", { enumerable: true, get: function () { return rules_1.generateDefaultConfig; } });
var filesystem_1 = require("./detectors/filesystem");
Object.defineProperty(exports, "FilesystemDetector", { enumerable: true, get: function () { return filesystem_1.FilesystemDetector; } });
var network_1 = require("./detectors/network");
Object.defineProperty(exports, "NetworkDetector", { enumerable: true, get: function () { return network_1.NetworkDetector; } });
var process_1 = require("./detectors/process");
Object.defineProperty(exports, "ProcessDetector", { enumerable: true, get: function () { return process_1.ProcessDetector; } });
//# sourceMappingURL=index.js.map