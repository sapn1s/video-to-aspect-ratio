const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

let aspectRatioWidth = 6;
let aspectRatioHeight = 9;

let folderPath = './videos/';

fs.readdirSync(folderPath).forEach(file => {
    execute(file);
  });

async function execute(filename){
    let newDimensions = await getNewDimensions(folderPath+filename, aspectRatioWidth, aspectRatioHeight);

    //Generating video
    ffmpeg(folderPath+filename)
    .complexFilter([
        `crop=${newDimensions.width}:${newDimensions.height}:in_w/2:in_h/2[output]`
    
    ], 'output')
    .saveToFile(`outputs/${filename}`)
    .on('start', function (commandLine) {
        console.log('Spawned Ffmpeg with command: ' + commandLine);
    })
    .on('error', function (err, stdout, stderr) {   
        console.log('Cannot process video: ' + err.message);
    })
    .on('end', function (stdout, stderr) {
        console.log('Transcoding succeeded !');
    })
}


function getNewDimensions(videoPath, widthAspectRatio, heightAspectRation){
    return new Promise((res, rej) => {
        ffmpeg.ffprobe(videoPath, function (err, metadata) {
            if (err) {
                console.error(err);
                return rej()
            } else {
        
                let mediaWidth = metadata.streams[0].width;
                let mediaHeight = metadata.streams[0].height;
                let newWidth = 1;
                let newHeight = 1;
        
                while (newWidth < mediaWidth && newHeight < mediaHeight) {
                    newWidth += widthAspectRatio;
                    newHeight += heightAspectRation;
                }
                newHeight -= widthAspectRatio;
                newHeight -= heightAspectRation;
        
                return res({"width": newWidth, "height": newHeight});
        
            }
        });
    })
}