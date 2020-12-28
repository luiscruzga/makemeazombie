const makemeazombie = require('../src/');
const zombie = new makemeazombie();
zombie.transform({
    photo: 'https://media.gq.com.mx/photos/5e220ec2ffa8c7000803441e/16:9/w_1920,c_limit/40-datos-curiosos-para-descubrir-a-scarlett-johansson.jpg',
    destinyFolder: './images'
})
.then(data => {
    console.log('image ok', data);
})
.catch(err => {
    console.log('Error', err);
})
