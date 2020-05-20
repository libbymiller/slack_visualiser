# slack_visualiser

Some node scripts for visualising activity on a slack channel

## Download your data

You need permission and a slack token of the right kind:

https://api.slack.com/authentication/token-types#bot

I used this deprecated method because I was in a rush

https://api.slack.com/methods/channels.history#arg_token

better would be https://api.slack.com/methods/conversations.history

    npm install request request-promise fs canvas

    mkdir data
    node getData.js 

## Generate your images

you'll probably need to tweak the parameters in the file
e.g. the number of images across and teh number of data files you got in step 1

    mkdir images
    node generateImages.js

## Generate the movie

    ffmpeg -framerate 20 -i images/images_%05d.png out.mp4

Quicktime doesn't seem happy with it, but vlc plays it and you can 
convert it with handbrake.
