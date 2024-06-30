# alphatab for a spin

Did [AlphaTab's web tutorial](https://alphatab.net/docs/tutorial-web/player#final-file)
and now trying to use the it with my own alphatab notation files for presentation and playback.
- Bass seems to be working fine.
- Drums either are buggy or I just missed something. Check `songs/drums.tex`

## alphatab url notes:

- https://alphatab.net/docs/alphatex/introduction
- https://github.com/CoderLine/alphaTabWebsite/tree/develop/static/files/features
- https://github.com/CoderLine/alphaTab/blob/develop/src/importer/AlphaTexImporter.ts
- https://github.com/CoderLine/alphaTab/blob/80a6b344f4f3e9fbdf8cbd927b750371c62f91e3/src/model/Note.ts#L154
- https://github.com/CoderLine/alphaTab/blob/80a6b344f4f3e9fbdf8cbd927b750371c62f91e3/src/model/PercussionMapper.ts#L11

## example sources of songs
- https://freebasstranscriptions.com/wp-content/uploads/2018/05/RHCP-Californication-2.pdf
- https://www.songsterr.com/a/wsa/u2-with-or-without-you-bass-tab-s8711

## debugging notes

```
api.score.tracks[0].playbackInfo.program // midi channel, 35 in bass
api.score.tracks[0].playbackInfo.primaryChannel // 0 in bass
api.score.tracks[0].staves[0].isPercussion // false in bass
api.score.tracks[0].staves[0].bars[0].voices[0].beats[0]
.duration
.notes[0]
    .octave
    .string
    .tone
```
