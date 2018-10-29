// Output [Lo que reemplaza en el string, el arreglo ya creado reemplazador, y los nuevos imports]
module.exports = (dato, arrayIn) => {

    const sceneOriginal = dato.match(/scene([ ]{0,})([:])([\[\]\w,\s])*]/g)[0];
    const soloScenes = sceneOriginal.split(/scene([ ]{0,}):([ ]{0,})/).join('').replace(/([\s\[\]])/g, '').split(',').filter((x) => x != '');
    const salida = `scene: ${JSON.stringify([...soloScenes, ...arrayIn]).replace(/"/g, '').replace(/,/g, ', ')}`;
    
    const newImports = arrayIn.reduce((prev, current) => `${prev}import ${current} from './scenes/${current}.js';\n`, '');

    return newImports+dato.replace(sceneOriginal, salida);
}