#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const { prompt } = require('inquirer');
const ora = require('ora');

const exec = require('child_process').exec;
const scaffolding = require('./scaffolding/scaffolding');

// Questions
const qNewProject = require('./questions/newProject');

const dirSrc = `src`;
const dirAssets = `assets`;
const dirScene = `src/scenes`;

const test = (d, option) => {
    // Generar nuevo proyecto
    if (program.new) {
        prompt(qNewProject).then((x) => {
            // Index
            let spinner = ora().start('Creating Project');
            // Folder structure
            if (!fs.existsSync(`./${d}`)) {
                fs.mkdirSync(`./${d}`);
                spinner.succeed('Create root folder!');

                // asset
                if (!fs.existsSync(`./${d}/`+dirAssets)) {
                    fs.mkdirSync(`./${d}/`+dirAssets);
                    spinner.succeed('Create assets folder!');
                }

                if (!fs.existsSync(`./${d}/`+dirSrc)) {
                    fs.mkdirSync(`./${d}/`+dirSrc);
                    spinner.succeed('Create src folder!');
                    if (!fs.existsSync(`./${d}/`+dirScene)) {
                        fs.mkdirSync(`./${d}/`+dirScene);
                        spinner.succeed('Create scene folder!');
                    }
                }
                // Files


                fs.writeFile(`./${d}/index.html`, scaffolding.index(x), function (err) {
                    if (err) throw err;
                    spinner.succeed('Saved index.js!');
                });

                // Main            
                fs.writeFile(`./${d}/${dirSrc}/main.js`, scaffolding.main(x), function (err) {
                    if (err) throw err;
                    spinner.succeed('Saved main.js!');
                });

                // Bootloader
                fs.writeFile(`./${d}/${dirSrc}/Bootloader.js`, scaffolding.bootloader(), function (err) {
                    if (err) throw err;
                    spinner.succeed('Saved bootloader.js!');
                });

                // Image logo
                require("fs").writeFile(`./${d}/${dirAssets}/logo_gamma.png`, scaffolding.logo_gamma(), 'base64', function (err) {
                    if (err) throw err;
                    spinner.succeed('Saved asset.js!');
                });
                spinner.stop();
                spinnerNpm = ora().start('installing Phaser');
                const cmd = `cd ./${d} && npm init -y && npm install --save phaser watch-http-server`;
                exec(cmd, function(error, stdout, stderr) {
                    console.log("stderr: ", stdout);
                    exec('npm install -g watch-http-server', function() {
                        spinnerNpm.succeed('Phaser installed');
                        spinnerNpm.stop();
                    });
                });
            }

        });
    }

    if (program.scene) {
        if (typeof (program.args[0]) === 'undefined') {
            console.log("El campo está vacío");
        } else {
            const spinner = ora().start('Creating scene ${fileName}');
            const fileName = d.charAt(0).toUpperCase() + d.slice(1);

            // crear la escena
            fs.readFile(`${dirSrc}/main.js`, function (err, data) {
                let datos = data.toString();
                let preScene = datos.split('scene: [')[1].split("]")[0];
                let scene = preScene.replace(/\r?\n|\r/g, '').trim();
                let newScenes = `${scene}, ${fileName}`;
                let output = `import ${fileName} from './scenes/${fileName}.js';\n` + datos.replace(preScene, newScenes);
                // Main            
                fs.writeFile(`${dirSrc}/main.js`, output, function (err) {
                    if (err) throw err;

                    // Created scene file
                    fs.writeFile(`${dirScene}/${fileName}.js`, scaffolding.sceneTemplate(fileName), function (err) {
                        if (err) throw err;
                        spinner.succeed(`Scene ${fileName} created`);
                        spinner.stop();
                    });
                });
            });
        }
    }
    if (program.server) {
        const cmd = `watch-http-server -a 127.0.0.1 -p 8082 -o -c-1`;
        exec(cmd);
        console.log("Server started at: http://localhost:8082");
        
    }
}

program
    .version('0.4.0')
    .option('-n, --new', 'Create a new proyect')
    .option('-s, --scene', 'Create a new scene')
    .option('-S, --server', 'Create the server')
    .action(test)
    .parse(process.argv);