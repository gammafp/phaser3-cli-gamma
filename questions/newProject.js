const validNumber = (value) => {
    let pass = value.match(/^[0-9]*$/);
    if(pass && value != '' && value != ' ') {
        return true;
    }
    return 'Please enter a number';
}

module.exports = [{
    type: 'input',
    name: 'title',
    message: 'Enter the games name'
}, {
    type: 'list',
    name: 'type',
    message: 'Select your type?',
    choices: [
      'Phaser.AUTO',
      'Phaser.CANVAS',
      'Phaser.WEBGL'
    ]
  }, {
    type: 'input',
    name: 'width',
    message: 'width of proyect', 
    validate: validNumber
}, {
    type: 'input',
    name: 'height',
    message: 'heigth of proyect',
    validate: validNumber
}, {
    type: 'list',
    name: 'pixelArt',
    message: 'Is a pixel art game?',
    choices: [
      'true',
      'false'
    ]
  }, {
    type: 'list',
    name: 'physics',
    message: 'Do you want arcade physics?',
    choices: [
      'true',
      'false'
    ]
  }
];

