module.exports = function (RED) {
    "use strict";
    
    var execSync = require('child_process').execSync;
    var spawn = require('child_process').spawn

    var testCommand = 'python3 ' + __dirname + '/testcontrol.py';
    var controlCommand = __dirname + '/control.py';
    var allOK = true;

    try {
        execSync(testCommand);
        RED.log.info("PiCase Inicializada");
    } catch (err) {
        allOK = false;
        RED.log.warn("PiCase : " + RED._("control.py no ejecutado. ") + err);
    }

    // Imprimir en tiempo real en el terminal desde de python
    process.env.PYTHONUNBUFFERED = 1;

    function DiNode(n) {
        RED.nodes.createNode(this, n);
        this.selectInput = n.selectInput;

        var node = this;

        if (allOK === true) {
            if (node.selectInput !== "select") {
                node.child = spawn(controlCommand, ["di", node.selectInput]);
                node.running = true;
                node.status({ fill: "yellow", shape: "dot", text: "DI status ok" });

                node.child.stdout.on('data', function (data) { /*leer informacion en consola*/
                    var d = data.toString().trim().split("\n");
                    for (var i = 0; i < d.length; i++) {
                        if (d[i] === '') { return; }
                        if (node.running && !isNaN(Number(d[i]))) {
                            node.send({ payload: Number(d[i]) });
                        }
                        node.status({ fill: "green", shape: "dot", text: d[i] });
                        if (RED.settings.verbose) { node.log("out: " + d[i] + " :"); }/*guardar informacion que se necesite*/
                    }
                });

                node.child.stderr.on('data', function (data) {
                    if (RED.settings.verbose) { node.log("err: " + data + " :"); }
                });

                node.child.on('close', function (code) {
                    node.running = false;
                    node.child = null;
                    if (RED.settings.verbose) { node.log(code); }
                    if (node.finished) {
                        node.status({ fill: "grey", shape: "ring", text: "DI closed" });
                        node.finished();
                    }
                    else { node.status({ fill: "red", shape: "ring", text: "DI stopped" }); }
                });

                node.child.on('error', function (err) {
                    if (err.errno === "ENOENT") { node.error(err); }
                    else if (err.errno === "EACCES") { node.error(RED._("command not executable")); }
                    else { node.error(RED._("error", { error: err.errno })) }
                    console.log(err);
                });

            }
            else {
                node.warn(RED._("invalid pin") + ": por favor seleccione un pin en el nodo DI");
            }
        }
        else {
            node.status({ fill: "grey", shape: "dot", text: "not available" });
            node.on("input", function (msg) {
                node.status({ fill: "grey", shape: "dot", text: RED._("status N/A", { value: msg.payload.toString() }) });
            });
        }

        node.on("close", function (done) {
            node.status({ fill: "grey", shape: "ring", text: "DI closed" });
            delete node.selectInput;
            if (node.child != null) {
                node.finished = done;
                node.child.stdin.write("close");
                node.child.kill('SIGKILL');
            }
            else { done(); }
        });
    }
    RED.nodes.registerType("DIs", DiNode);

    function ButtonNode(n) {
        RED.nodes.createNode(this, n);
        this.selectInput = n.selectInput;

        var node = this;

        if (allOK === true) {
            if (node.selectInput !== "select") {
                node.child = spawn(controlCommand, ["s", node.selectInput]);
                node.running = true;
                node.status({ fill: "yellow", shape: "dot", text: "S status ok" });

                node.child.stdout.on('data', function (data) {
                    var d = data.toString().trim().split("\n");
                    for (var i = 0; i < d.length; i++) {
                        if (d[i] === '') { return; }
                        if (node.running && !isNaN(Number(d[i]))) {
                            node.send({ payload: Number(d[i]) });
                        }
                        node.status({ fill: "green", shape: "dot", text: d[i] });
                        if (RED.settings.verbose) { node.log("out: " + d[i] + " :"); }
                    }
                });

                node.child.stderr.on('data', function (data) {
                    if (RED.settings.verbose) { node.log("err: " + data + " :"); }
                });

                node.child.on('close', function (code) {
                    node.running = false;
                    node.child = null;
                    if (RED.settings.verbose) { node.log(code); }
                    if (node.finished) {
                        node.status({ fill: "grey", shape: "ring", text: "S closed" });
                        node.finished();
                    }
                    else { node.status({ fill: "red", shape: "ring", text: "S stopped" }); }
                });

                node.child.on('error', function (err) {
                    if (err.errno === "ENOENT") { node.error(err); }
                    else if (err.errno === "EACCES") { node.error(RED._("command not executable")); }
                    else { node.error(RED._("error", { error: err.errno })) }
                    console.log(err);
                });

            }
            else {
                node.warn(RED._("invalid pin") + ": por favor seleccione un pin en el nodo BUTTON");
            }
        }
        else {
            node.status({ fill: "grey", shape: "dot", text: "not available" });
            node.on("input", function (msg) {
                node.status({ fill: "grey", shape: "dot", text: RED._("status N/A", { value: msg.payload.toString() }) });
            });
        }

        node.on("close", function (done) {
            node.status({ fill: "grey", shape: "ring", text: "S closed" });
            delete node.selectInput;
            if (node.child != null) {
                node.finished = done;
                node.child.kill('SIGKILL');
            }
            else { done(); }
        });
    }
    RED.nodes.registerType("Buttons", ButtonNode);

    function LedOutNode(n) {
        RED.nodes.createNode(this, n);
        this.selectInput = n.selectInput;

        var node = this;

        function inputlistener(msg, send, done) {
            if (msg.payload === "true") { msg.payload = true; }
            if (msg.payload === "false") { msg.payload = false; }
            var out = Number(msg.payload);
            var limit = 1;
            if ((out >= 0) && (out <= limit)) {
                if (RED.settings.verbose) { node.log("out: " + out); }
                if (node.child !== null) {
                    node.child.stdin.write(out + "\n", () => {
                        if (done) { done(); }
                    });
                    node.status({ fill: "green", shape: "dot", text: out.toString() });
                }
                else {
                    node.error(RED._("python command not found"), msg);
                    node.status({ fill: "red", shape: "ring", text: "not running" });
                }
            }
            else { node.warn(RED._("invalid input") + ": " + out); }
        }
        if (allOK == true) {
            if (node.selectInput !== "select") {
                node.child = spawn(controlCommand, ["lout", node.selectInput]);
                node.status({ fill: "green", shape: "dot", text: "0" });

                node.running = true;

                node.on("input", inputlistener);

                node.child.stdout.on('data', function (data) {
                    if (RED.settings.verbose) { node.log("out: " + data + " :"); }
                });

                node.child.stderr.on('data', function (data) {
                    if (RED.settings.verbose) { node.log("err: " + data + " :"); }
                });

                node.child.on('close', function (code) {
                    node.child = null;
                    node.running = false;
                    if (RED.settings.verbose) { node.log(RED._("status closed")); }
                    if (node.finished) {
                        node.status({ fill: "grey", shape: "ring", text: "LED closed" });
                        node.finished();
                    }
                    else { node.status({ fill: "red", shape: "ring", text: "LED stopped" }); }
                });

                node.child.on('error', function (err) {
                    if (err.errno === "ENOENT") { node.error(RED._("command not found")); }
                    else if (err.errno === "EACCES") { node.error(RED._("command not executable")); }
                    else { node.error(RED._("error") + ': ' + err.errno); }
                });

            }
            else {
                node.warn(RED._("invalid pin") + ": por favor seleccione un pin en el nodo LED");
            }
        }
        else {
            node.status({ fill: "grey", shape: "dot", text: "not available" });
            node.on("input", function (msg) {
                node.status({ fill: "grey", shape: "dot", text: RED._("status N/A", { value: msg.payload.toString() }) });
            });
        }

        node.on("close", function (done) {
            node.status({ fill: "grey", shape: "ring", text: "LED closed" });
            delete node.selectInput;
            if (node.child != null) {
                node.finished = done;
                node.child.stdin.write("close" + "\n");
                setTimeout(() => {
                    node.child.kill('SIGKILL');
                }, 10);
            }
            else { done(); }
        });
    }
    RED.nodes.registerType("LEDs", LedOutNode);

    function DoNode(n) {
        RED.nodes.createNode(this, n);
        this.selectInput = n.selectInput;

        var node = this;

        function inputlistener(msg, send, done) {
            if (msg.payload === "true") { msg.payload = true; }
            if (msg.payload === "false") { msg.payload = false; }
            var out = Number(msg.payload);
            var limit = 1;
            if ((out >= 0) && (out <= limit)) {
                if (RED.settings.verbose) { node.log("out: " + out); }
                if (node.child !== null) {
                    node.child.stdin.write(out + "\n", () => {
                        if (done) { done(); }
                    });
                    node.status({ fill: "green", shape: "dot", text: out.toString() });
                }
                else {
                    node.error(RED._("python command not found"), msg);
                    node.status({ fill: "red", shape: "ring", text: "not running" });
                }
            }
            else { node.warn(RED._("invalid input") + ": " + out); }
        }

        if (allOK === true) {
            if (node.selectInput !== "select") {
                node.child = spawn(controlCommand, ["do", node.selectInput]);
                node.status({ fill: "green", shape: "dot", text: "0" });

                node.running = true;

                node.on("input", inputlistener);

                node.child.stdout.on('data', function (data) {
                    if (RED.settings.verbose) { node.log("out: " + data + " :"); }
                });

                node.child.stderr.on('data', function (data) {
                    if (RED.settings.verbose) { node.log("err: " + data + " :"); }
                });

                node.child.on('close', function (code) {
                    node.child = null;
                    node.running = false;
                    if (RED.settings.verbose) { node.log(RED._("status closed")); }
                    if (node.finished) {
                        node.status({ fill: "grey", shape: "ring", text: "DO closed" });
                        node.finished();
                    }
                    else { node.status({ fill: "red", shape: "ring", text: "DO stopped" }); }
                });

                node.child.on('error', function (err) {
                    if (err.errno === "ENOENT") { node.error(RED._("command not found")); }
                    else if (err.errno === "EACCES") { node.error(RED._("command not executable")); }
                    else { node.error(RED._("error") + ': ' + err.errno); }
                });

            }
            else {
                node.warn(RED._("invalid pin") + ": por favor seleccione un pin en el nodo DO");
            }
        }
        else {
            node.status({ fill: "grey", shape: "dot", text: "not available" });
            node.on("input", function (msg) {
                node.status({ fill: "grey", shape: "dot", text: RED._("status N/A", { value: msg.payload.toString() }) });
            });
        }

        node.on("close", function (done) {
            node.status({ fill: "grey", shape: "ring", text: " DO closed" });
            delete node.selectInput;
            if (node.child != null) {
                node.finished = done;
                node.child.stdin.write("close" + "\n");
                setTimeout(() => {
                    node.child.kill('SIGKILL');
                }, 10);
            }
            else { done(); }
        });
    }
    RED.nodes.registerType("DOs", DoNode);

    function ADCNode(n) {
        RED.nodes.createNode(this, n);
        this.selectType = n.selectType;
        this.selectVoltage = n.selectVoltage;
        this.selectCurrent = n.selectCurrent;

        var node = this;

        if (allOK === true) {
            if (node.selectType == 1 && node.selectVoltage !== "select") {
                node.child = spawn(controlCommand, ["adc", node.selectVoltage]);
                node.running = true;
                node.status({ fill: "yellow", shape: "dot", text: "ADC status ok" });

                node.child.stdout.on('data', function (data) {
                    var d = data.toString().trim().split("\n");
                    for (var i = 0; i < d.length; i++) {
                        if (d[i] === '') { return; }
                        if (node.running && !isNaN(Number(d[i]))) {
                            node.send({ payload: Number(d[i]) });
                        }
                        node.status({ fill: "green", shape: "dot", text: d[i] });
                        if (RED.settings.verbose) { node.log("out: " + d[i] + " :"); }
                    }
                });

                node.child.stderr.on('data', function (data) {
                    if (RED.settings.verbose) { node.log("err: " + data + " :"); }
                });

                node.child.on('close', function (code) {
                    node.running = false;
                    node.child = null;
                    if (RED.settings.verbose) { node.log(code); }
                    if (node.finished) {
                        node.status({ fill: "grey", shape: "ring", text: "ADC closed" });
                        node.finished();
                    }
                    else { node.status({ fill: "red", shape: "ring", text: "ADC stopped" }); }
                });

                node.child.on('error', function (err) {
                    if (err.errno === "ENOENT") { node.error(err); }
                    else if (err.errno === "EACCES") { node.error(RED._("command not executable")); }
                    else { node.error(RED._("error", { error: err.errno })) }
                    console.log(err);
                });

            }
            else if (node.selectType == 2 && node.selectCurrent !== "select") {
                node.child = spawn(controlCommand, ["adc", node.selectCurrent]);
                node.running = true;
                node.status({ fill: "yellow", shape: "dot", text: "ADC status ok" });

                node.child.stdout.on('data', function (data) {
                    var d = data.toString().trim().split("\n");
                    for (var i = 0; i < d.length; i++) {
                        if (d[i] === '') { return; }
                        if (node.running && !isNaN(Number(d[i]))) {
                            node.send({ payload: Number(d[i]) });
                        }
                        node.status({ fill: "green", shape: "dot", text: d[i] });
                        if (RED.settings.verbose) { node.log("out: " + d[i] + " :"); }
                    }
                });

                node.child.stderr.on('data', function (data) {
                    if (RED.settings.verbose) { node.log("err: " + data + " :"); }
                });

                node.child.on('close', function (code) {
                    node.running = false;
                    node.child = null;
                    if (RED.settings.verbose) { node.log(code); }
                    if (node.finished) {
                        node.status({ fill: "grey", shape: "ring", text: "ADC closed" });
                        node.finished();
                    }
                    else { node.status({ fill: "red", shape: "ring", text: "ADC stopped" }); }
                });

                node.child.on('error', function (err) {
                    if (err.errno === "ENOENT") { node.error(err); }
                    else if (err.errno === "EACCES") { node.error(RED._("command not executable")); }
                    else { node.error(RED._("error", { error: err.errno })) }
                    console.log(err);
                });

            }
            else {
                node.warn(RED._("invalid pin") + ": por favor seleccione un pin en el nodo ADC" );
            }
        }
        else {
            node.status({ fill: "grey", shape: "dot", text: "not available" });
            node.on("input", function (msg) {
                node.status({ fill: "grey", shape: "dot", text: RED._("status N/A", { value: msg.payload.toString() }) });
            });
        }

        node.on("close", function (done) {
            node.status({ fill: "grey", shape: "ring", text: "ADC closed" });
            delete node.selectType;
            delete node.selectVoltage;
            delete node.selectCurrent;
            if (node.child != null) {
                node.finished = done;
                node.child.kill('SIGKILL');
            }
            else { done(); }
        });
    }
    RED.nodes.registerType("ADCs", ADCNode);

    function DACNode(n) {
        RED.nodes.createNode(this, n);
        this.selectType = n.selectType;
        this.selectVoltage = n.selectVoltage;
        this.selectCurrent = n.selectCurrent;

        var node = this;

        function inputlistener(msg, send, done) {
            var out = Number(msg.payload);
            if (out < 0.0) { out = 0.0 }
            if (out > 100.0) { out = 100 }
            var limit = 100.0;
            if ((out >= 0) && (out <= limit)) {
                if (RED.settings.verbose) { node.log("out: " + out); }
                if (node.child !== null) {
                    node.child.stdin.write(out + "\n", () => {
                        if (done) { done(); }
                    });
                    node.status({ fill: "green", shape: "dot", text: out.toString() });
                }
                else {
                    node.error(RED._("python command not found"), msg);
                    node.status({ fill: "red", shape: "ring", text: "not running" });
                }
            }
            else { node.warn(RED._("invalid input") + ": " + out); }
        }
        if (allOK === true) {
            if (node.selectType == 1 && node.selectVoltage !== "select") {
                node.child = spawn(controlCommand, ["dac", node.selectVoltage]);
                node.status({ fill: "green", shape: "dot", text: "0" });

                node.running = true;

                node.on("input", inputlistener);

                node.child.stdout.on('data', function (data) {
                    if (RED.settings.verbose) { node.log("out: " + data + " :"); }
                });

                node.child.stderr.on('data', function (data) {
                    if (RED.settings.verbose) { node.log("err: " + data + " :"); }
                });

                node.child.on('close', function (code) {
                    node.child = null;
                    node.running = false;
                    if (RED.settings.verbose) { node.log(RED._("status closed")); }
                    if (node.finished) {
                        node.status({ fill: "grey", shape: "ring", text: "DAC closed" });
                        node.finished();
                    }
                    else { node.status({ fill: "red", shape: "ring", text: "DAC stopped" }); }
                });

                node.child.on('error', function (err) {
                    if (err.errno === "ENOENT") { node.error(RED._("command not found")); }
                    else if (err.errno === "EACCES") { node.error(RED._("command not executable")); }
                    else { node.error(RED._("error") + ': ' + err.errno); }
                });

            }
            else if (node.selectType == 2 && node.selectCurrent !== "select") {
                node.child = spawn(controlCommand, ["dac", node.selectCurrent]);
                node.status({ fill: "green", shape: "dot", text: "0" });

                node.running = true;

                node.on("input", inputlistener);

                node.child.stdout.on('data', function (data) {
                    if (RED.settings.verbose) { node.log("out: " + data + " :"); }
                });

                node.child.stderr.on('data', function (data) {
                    if (RED.settings.verbose) { node.log("err: " + data + " :"); }
                });

                node.child.on('close', function (code) {
                    node.child = null;
                    node.running = false;
                    if (RED.settings.verbose) { node.log(RED._("status closed")); }
                    if (node.finished) {
                        node.status({ fill: "grey", shape: "ring", text: "DAC closed" });
                        node.finished();
                    }
                    else { node.status({ fill: "red", shape: "ring", text: "DAC stopped" }); }
                });

                node.child.on('error', function (err) {
                    if (err.errno === "ENOENT") { node.error(RED._("command not found")); }
                    else if (err.errno === "EACCES") { node.error(RED._("command not executable")); }
                    else { node.error(RED._("error") + ': ' + err.errno); }
                });

            }
            else {
                node.warn(RED._("invalid pin") + ":  por favor seleccione un pin en el nodo DAC");
            }
        }
        else {
            node.status({ fill: "grey", shape: "dot", text: "not available" });
            node.on("input", function (msg) {
                node.status({ fill: "grey", shape: "dot", text: RED._("status N/A", { value: msg.payload.toString() }) });
            });
        }

        node.on("close", function (done) {
            node.status({ fill: "grey", shape: "ring", text: "DAC closed" });
            delete node.selectType;
            delete node.selectVoltage;
            delete node.selectCurrent;
            if (node.child != null) {
                node.finished = done;
                node.child.stdin.write("close" + "\n");
                setTimeout(() => {
                    node.child.kill('SIGKILL');
                }, 10);
            }
            else { done(); }
        });
    }
    RED.nodes.registerType("DACs", DACNode);
}

