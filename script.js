let currentSong = new Audio();
let songs;
let currFolder;
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${currFolder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/%5")[1]);
        }
    }
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="music.svg" alt="music icon">
                            <div class="info">
                                <div>${song.split("%5C")[2].replaceAll("%20", " ")}</div>
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
    currentSong.src = `/${currFolder}/` + track.replaceAll(" ", "%20");
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "0:00 / 0:00";

}

async function displayAlbums() {
    let a = await fetch(`songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    console.log(div);
    let anchores = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchores);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if(e.href.includes("%5Csongs")){
            let folder = e.href.split("%5C")[2].slice(0, -1);
            let a = await fetch(`songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="songs/${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM252.3 211.1C244.7 215.3 240 223.4 240 232L240 408C240 416.7 244.7 424.7 252.3 428.9C259.9 433.1 269.1 433 276.6 428.4L420.6 340.4C427.7 336 432.1 328.3 432.1 319.9C432.1 311.5 427.7 303.8 420.6 299.4L276.6 211.4C269.2 206.9 259.9 206.7 252.3 210.9z"/></svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
        }
        
    }
     Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async element => {
            songs = await getSongs(`${element.currentTarget.dataset.folder}`)
            playMusic(songs[0].split("%5C")[2].replaceAll("%20", " "), false);
        })
    })
    return songs;
}

async function main() {

    await getSongs("songs/happy");
    playMusic(songs[0].split("%5C")[2].replaceAll("%20", " "), true);

    displayAlbums()

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
        let index = getSongIndex(songs, currentSong.src);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1].split("%5C")[2].replaceAll("%20", " "), false);
        }
    });

    next.addEventListener("click", () => {
        let index = getSongIndex(songs, currentSong.src);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1].split("%5C")[2].replaceAll("%20", " "), false);
        }
    });

    currentSong.addEventListener("ended", () => {
    let index = getSongIndex(songs, currentSong.src);
    if ((index + 1) < songs.length) {
        playMusic(
            songs[index + 1].split("%5C")[2].replaceAll("%20", " "),
            false
        );
    } else {
        // Optional: restart playlist from the beginning
        playMusic(songs[0].split("%5C")[2].replaceAll("%20", " "), false);
    }
});

   
}
main();