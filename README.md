# cmc-myowand

A myoelectric sensor demonstrator, converting muscular electrical impulses into music.

## overview

There are two main subfolders here: `electronics` contains the schematics and board layouts, as well as some information on how they were designed. `code` contains two things:

 * `cinci-biomed-myo`: the Arduino sketch that processes the amplified myoelectric signals and outputs them to the computer over serial
 * `myowand-audio`: the JavaScript code to receive the Arduino's messages and conver them into musical tones.
