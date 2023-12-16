# Canvas

This library allows the manipulation of pictures. 

```js
import Canvas from "canvas";
```

In this project, it is used by `concrete` and `vest` commands.
They aim to generate customised pictures from a general pic and some user data.

- [Setup](#setup)
- [Picture](#picture)
    - [Draw](#draw)
    - [Write text](#write)
- [Gif](#gif)

## Setup


First, the files folder must be loaded. This requires the `fs` and `path` libraries.
Example with the `concrete`:
```js
  const gifsPath = path.join(
    path.resolve(path.dirname("")),
    "pics",
    "concrete",
    "gifs"
  ); //create file path
  const dir = fs.readdirSync(gifsPath); //load folder
```

Now it's time to create the `canvas` object that will allow picture modification.
The canvas construction requires a size. Often, it's the picture size.

```js
    const canvas = Canvas.createCanvas(1078, 1260); // Canvas creation
    const context = canvas.getContext("2d"); // context allows canvas further modification
```


## Picture

Now, the `canvas` can load the pictures used.
```js
    const avatar = await Canvas.loadImage(
      // Load target avatar
      target.displayAvatarURL({ extension: "png" })
    );
```
> Note: the `load` does not write the picture in the canvas. It's done in `context`.

The `drawImage` requires the image, its coordinates (x, y) and its size (x, y).
```js
    context.drawImage(avatar, 470, 360, 160, 160); //add avatar
```

### Draw

To add a circle picture, there are 5 operations to apply. Firstly, draw a circle:
```js
    //draw circle
    context.beginPath(); // Pick up the pen
    context.arc(160, 360, 40, 0, Math.PI * 2, true); // Start the arc to form a circle
    context.closePath(); // Put the pen down
    context.clip(); // Clip off the region you drew on
```
The `canvas` library allowsto draw shapes.
This is exactly like a real drawing: taking a pen, draw, and put the pen down.
After that, the picture can be added.

### Write 

`canvas` allows to write text on pictures.
It requires the setup of the font, and then write the text on a defined position.
```js
    context.font = `60px sans-serif`; //font size
    context.fillStyle = "#000000"; //font color
    context.fillText(text, 712, 490);
```

## Gif

Create a gif is harder than a picture, because its not only 1 picture but an assembly.
To do this, the `GIFEncoder` library is used in tandem.
It start the encoder with the delay between frames.
After, the frames are added. When required, the encoder is stopped.

```js
    const encoder = new GIFEncoder(canvas.width, canvas.height); // width, heigth
    encoder.setDelay(33); //delay between each gif frame in ms
    encoder.start();
    // missing code to simplify
    encoder.addFrame(context);
    encoder.finish();
```

Then, the data can be saved as a gif.
```js
    buffer = encoder.out.getData(); //Recover the gif
```
