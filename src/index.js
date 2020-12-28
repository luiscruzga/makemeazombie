const request = require('request');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { convertTo64 } = require('../utils/base64');

const randomUUI = (a,b) => {for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'');return b}

/**
 * toonify class class that allows you to transform an image (where a person's face is clearly visible) to give it an zombie effect.
 * 
 * @class makemeazombie
 * @see {@link https://makemeazombie.com|MakemeaZombie}
 */

class makemeazombie {
    constructor() {}

    /**
     * Allows you to transform an image to apply an zombie style
     * 
     * @param {objet} args
     * @param {string} args.photo - Image to transform, can be image path, image url or base64 image
     * @param {string} args.destinyFolder - Path to save the transformed image, if not provided the image will be delivered in base64
     * @return {Promise<string>} Transformed image
     */
    transform(args) {
        return new Promise((resolve, reject) => {
            if (typeof args.photo !== 'undefined' && args.photo !== '') {
                convertTo64(args.photo)
                .then(async (res) => {
                    let nameFile = `${ randomUUI() }.jpeg`;
                    let pathImage = path.join(__dirname, `../images/${ nameFile }`);
                    let base64Image = res.split(';base64,').pop();
                    fs.writeFileSync(pathImage, base64Image, {encoding: 'base64'}, (err) => {
                        if(err) log.error('File created with error');
                    });

                    request.post({
                        url: 'https://zombieapi.azurewebsites.net/transform',
                        contentType: false,
                        formData: {
                            image: fs.createReadStream(pathImage)
                        }
                    }, async (error, response, body) => {
                        // Delete image
                        fs.unlinkSync(pathImage);

                        if (error){
                            reject('An error occurred while trying to transform the image');
                        } else {
                            if (body === 'No face found') {
                                reject('It was not possible to identify a face in the image, try sending a profile image');
                            } else {
                                let imgBuffer =  Buffer.from(body, 'base64');
                                sharp(imgBuffer)
                                .extract({ width: 512, height: 512, left: 512, top: 0 })
                                .resize(720, 720)
                                .toBuffer()
                                .then( buffer => {
                                    if (args.destinyFolder !== undefined && args.destinyFolder !== ''){
                                        if (fs.existsSync(args.destinyFolder)) {
                                            const finalImage = path.join(args.destinyFolder, nameFile);
                                            fs.writeFileSync(finalImage, buffer.toString('base64'), {encoding: 'base64'}, (err) => {
                                                console.log('File created');
                                            });
                                            resolve(finalImage);   
                                        } else {
                                            reject('Destiny Directory not found.');
                                        }
                                    } else {
                                        resolve(buffer.toString('base64'));   
                                    }
                                })
                                .catch( err => {
                                    reject('An error occurred while trying to transform the image with sharp');
                                })

                            }
                        }
                    });
                })
                .catch(err => {
                    reject(err);
                })
            } else {
                reject('An image must be provided to transform...');
            }
        })
    }
}

module.exports = makemeazombie;