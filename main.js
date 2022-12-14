const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const settings = require('./settings.json')

let folderPath = './videos/';
let re = /(?:\.([^.]+))?$/;
let ext;
fs.readdirSync(folderPath).forEach(file => {
    ext = re.exec(file)[1]; 
    if(settings.video_formats.includes(ext.toLowerCase())) execute(file);
  });

async function execute(filename){
    let newDimensions = await getNewDimensions(folderPath+filename, settings.aspectRatioWidth, settings.aspectRatioHeight);

    //Generating video
    ffmpeg(folderPath+filename)
    .complexFilter([
        `crop=${newDimensions.width}:${newDimensions.height}:in_w/2:in_h/2[cropped]`,
        `[cropped]scale=${settings.width}:${settings.height}[output]`
    
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