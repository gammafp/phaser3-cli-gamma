#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const {
    prompt
} = require('inquirer');
const ora = require('ora');

const https = require('https');
const exec = require('child_process').exec;
const scaffolding = require('./scaffolding/scaffolding');
const libs = require('./libs/libs');

// Questions
const qNewProject = require('./questions/newProject');

const dirSrc = `src`;
const dirAssets = `assets`;
const dirScene = `src/scenes`;

const test = (d, option) => {
    // argumentos
    const argumentos = Array.from(program.args).filter((x, i, arr) => i != arr.length - 1);
    // Generar nuevo proyecto
    if (program.new) {
        const folderName = (argumentos.length === 0) ? 'Phaser3_Gammafp' : argumentos[0];

        prompt(qNewProject).then((respuestas) => {
            // Index
            let spinner = ora().start('Creating Project');
            // Folder structure
            if (!fs.existsSync(`./${folderName}`)) {
                fs.mkdirSync(`./${folderName}`);
                spinner.succeed('Create root folder!');

                // asset
                if (!fs.existsSync(`./${folderName}/` + dirAssets)) {
                    fs.mkdirSync(`./${folderName}/` + dirAssets);
                    spinner.succeed('Create assets folder!');
                }

                if (!fs.existsSync(`./${folderName}/` + dirSrc)) {
                    fs.mkdirSync(`./${folderName}/` + dirSrc);
                    spinner.succeed('Create src folder!');
                    if (!fs.existsSync(`./${folderName}/` + dirScene)) {
                        fs.mkdirSync(`./${folderName}/` + dirScene);
                        spinner.succeed('Create scene folder!');
                    }
                }
                // Files
                fs.writeFile(`./${folderName}/index.html`, scaffolding.index(respuestas), function (err) {
                    if (err) throw err;
                    spinner.succeed('Saved index.js!');
                });

                // Main        
                fs.writeFile(`./${folderName}/${dirSrc}/main.js`, scaffolding.main(respuestas), function (err) {
                    if (err) throw err;
                    spinner.succeed('Saved main.js!');
                });

                // Bootloader
                fs.writeFile(`./${folderName}/${dirSrc}/Bootloader.js`, scaffolding.bootloader(), function (err) {
                    if (err) throw err;
                    spinner.succeed('Saved bootloader.js!');
                });

                // Image logo
                fs.writeFile(`./${folderName}/${dirAssets}/logo_gamma.png`, scaffolding.logo_gamma(), 'base64', function (err) {
                    if (err) throw err;
                    spinner.succeed('Saved assets!\n');
                });

                // Creador de .editorconfig
                fs.writeFile(`./${folderName}/.editorconfig`, scaffolding.editorconfig(), function (err) {
                    if (err) throw err;
                    spinner.succeed('Saved .editorconfig!');
                });

                // Creador de .gamma (para comprobar el directorio y se usará para la configuración)
                fs.writeFile(`./${folderName}/.gamma`, '# Proyecto creado con Phaser 3 cli gammafp', function (err) {
                    if (err) throw err;
                });

                spinner.stop();

                const spinnerDefinitions = ora().start('Donwload Phaser definitions\n');
                // Descargar definiciones de Phaser
                if (respuestas.definitions === 'Yes') {
                    // Descargamos las definiciones
                    fs.writeFile(`./${folderName}/index.html`, scaffolding.index(respuestas), function (err) {
                        if (err) throw err;
                        spinner.succeed('Saved index.js!');
                    });

                    fs.mkdirSync(`./${folderName}/def`);
                    const phaserDef = fs.createWriteStream(`${folderName}/def/phaser.d.ts`);

                    https.get('https://raw.githubusercontent.com/photonstorm/phaser3-docs/master/typescript/phaser.d.ts', function(response) {
                        response.pipe(phaserDef);
                        spinnerDefinitions.stop();
                    });

                    // Iniciamos el jsonconfig.json
                    fs.writeFile(`${folderName}/jsconfig.json`, '{}', (err) => console.log(err) );
                    spinnerDefinitions.succeed('Phaser definitions OK');
                    spinnerDefinitions.stop();
                }

                // Instalar Phaser por npm FINAL
                const spinnerPhaserInstall = ora().start('installing Phaser\n');
                const cmd = `cd ./${folderName} && npm init -y && npm install --save phaser`;
                exec(cmd, function (error, stdout, stderr) {
                    // console.log("stderr: ", stdout);
                    spinnerPhaserInstall.succeed('Phaser installed');
                    spinnerPhaserInstall.stop();
                });

            }

        });
    }
    // Comprobar si es un proyecto de Phaser 3 gammafp
    else if (fs.existsSync('./.gamma')) {
        if (program.scene) {

            if (argumentos.length === 0) {
                console.log("El campo está vacío");
            } else {
                // crear la escena
                fs.readFile(`${dirSrc}/main.js`, function (err, data) {

                    // Separar y agregar escenas en el array de escenas
                    let datos = data.toString();
                    const datosEntrada = argumentos.map((x) => libs.capitalize(x));
                    const output = libs.getScenes(datos, datosEntrada);

                    // Main            
                    fs.writeFile(`${dirSrc}/main.js`, output, function (err) {
                        if (err) throw err;
                    });

                    // Con los argumentos hacemos un map y creamos los archivos de cada escena
                    argumentos.map((x) => {
                        const fileName = libs.capitalize(x);
                        const spinner = ora().start(`Creating scene ${fileName}\n`);

                        // Created scene file
                        fs.writeFile(`${dirScene}/${fileName}.js`, scaffolding.sceneTemplate(fileName), function (err) {
                            if (err) throw err;
                            spinner.succeed(`All scenes are created`);
                            spinner.stop();
                        });
                    });

                });
            }
        }

    } else {
        console.log('Sorry, there are no Phaser 3 Projects made with Phaser 3 CLI gammafp in this directory.');
    }
    if (program.test) {
        console.log(d);
    }

}

program
    .version('1.2.1')
    .option('-n, --new', 'Create a new proyect')
    .option('-s, --scene', 'Create a new scene')
    .option('-t, --test', 'Test')
    .option('-d, --definitions', 'Download and configure Phaser definitions')
    .action(test)
    .parse(process.argv);