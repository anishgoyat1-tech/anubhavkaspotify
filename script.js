let currentSong = new Audio();
let songs;
async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/songs/")
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/%5")[1]);
        }
    }
    return songs;
}
function formatToMinutesSeconds(totalSeconds) {
    totalSeconds = Math.floor(totalSeconds);

    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    // Add leading zeros
    let formattedMinutes = String(minutes).padStart(2, "0");
    let formattedSeconds = String(seconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

const playMusic = (track, pause = false) => {
    currentSong.src = "/songs/" + track.replaceAll(" ", "%20");
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "0:00 / 0:00";
}

async function main() {

    songs = await getSongs();
    playMusic(songs[0].split("%5C")[1].replaceAll("%20", " "), true);
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="music.svg" alt="music icon">
                            <div class="info">
                                <div>${song.split("%5C")[1].replaceAll("%20", " ")}</div>
                                <div>Anubhav</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div></li>`;
    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = formatToMinutesSeconds(currentSong.currentTime) + " / " + formatToMinutesSeconds(currentSong.duration);
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration * 100) + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

  function getSongIndex(songs, currentSongSrc) {
  // Extract the filename from currentSong.src
  let currentFile = decodeURIComponent(currentSongSrc).split("/").pop();

  return songs.findIndex(song => {
    // Extract filename from song in array (remove path if any)
    let songFile = decodeURIComponent(song).split("\\").pop(); // handles Csongs\ path
    return songFile === currentFile;
  });
}

    prev.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/%5C")[1].replaceAll("%20", " "));
        if ((index - 1) < 0) {
            playMusic(songs[songs.length - 1].split("%5C")[1].replaceAll("%20", " "));
        }
    });

    next.addEventListener("click", () => {
        let index = getSongIndex(songs, currentSong.src);
        console.log(index);
        if ((index + 1) <= songs.length) {
            playMusic(songs[index+1].split("%5C")[1].replaceAll("%20", " "),true);
        }
    });
}
main();