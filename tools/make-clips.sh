#!/bin/sh
# Cuts the lyric clips from the master (kept out of the repo) using tools/clip-times.json.
# Usage: sh tools/make-clips.sh /path/to/Fireworks_Master.mp3
set -e
MASTER="$1"; [ -f "$MASTER" ] || { echo "Usage: sh tools/make-clips.sh /path/to/master.mp3"; exit 1; }
OUT="$(dirname "$0")/../public/assets/clips"; mkdir -p "$OUT"; rm -f "$OUT"/*.mp3 "$OUT"/manifest.json
node -e '
const fs=require("fs"),cp=require("child_process"),path=require("path");
const [master,out,times]=process.argv.slice(1);
const sec=v=>typeof v==="number"?v:String(v).split(":").reduce((a,x)=>a*60+Number(x),0);
const m={};
JSON.parse(fs.readFileSync(times,"utf8")).clips.forEach((c,i)=>{
  if(c.start==null||c.end==null) return;
  const s=sec(c.start), e=sec(c.end), f=String(i+1).padStart(2,"0")+".mp3", d=e-s;
  cp.execFileSync("ffmpeg",["-v","error","-y","-ss",String(s),"-t",String(d),"-i",master,"-af","loudnorm=I=-16:LRA=11:TP=-1.5,afade=t=in:d=0.25,afade=t=out:st="+Math.max(0,d-0.6)+":d=0.6","-c:a","libmp3lame","-b:a","96k",path.join(out,f)]);
  m[i]=f;
});
fs.writeFileSync(path.join(out,"manifest.json"),JSON.stringify(m));
console.log("clips written:",Object.keys(m).length);
' "$MASTER" "$OUT" "$(dirname "$0")/clip-times.json"
