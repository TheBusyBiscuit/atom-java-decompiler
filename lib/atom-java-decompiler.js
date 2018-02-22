'use babel';

import { CompositeDisposable } from "atom";

import child_process from "child_process";
import path from "path";
import FileSystem from "fs";
const temp = require("temp").track();

const decompiler = "procyon-0.5.30.jar";

export default {
    activate(state) {
        var instance = this;

        atom.workspace.addOpener(function(uri) {
            if (path.extname(uri) === ".class") {
                return instance.decompile(uri);
            }
        });
    },

    deactivate() {},

    decompile(uri) {
        return new Promise(function(resolve, reject) {
            var process = child_process.spawn("java", ["-jar", path.join(__dirname, "procyon/" + decompiler), uri]);

            var buffer = "";

            process.stderr.on('data', function(data) {
                buffer += data;
            });

            process.stdout.on('data', function(data) {
                buffer += data;
            });

            process.on('close', function(status) {
                if (status === 0) {
                    temp.open({
                        prefix: "atom_java_decompiler",
                        suffix: ".java"
                    }, function(err, info) {
                        if (!err) {
                            FileSystem.writeFile(info.path, buffer, "UTF-8", function(err) {
                                if (!err) {
                                    resolve(atom.workspace.open(info.path));
                                }
                                else {
                                    reject();
                                }
                            });
                        }
                        else {
                            reject();
                        }
                    });
                }
                else {
                    reject();
                }
            });
        });
    }
};
