$(document).ready(function () {

    let beats = [];
    let favoriteBeats = [];
    let activeList = [];
    let currentIndex = -1;
    const audio = $("#audioPlayer")[0];




    // ----------------------------------------
    // ICON CONSTANTS
    // ----------------------------------------
    const ICON_PLAY  = "▶";
    const ICON_PAUSE = "⏸";






    // ----------------------------------------
    // PLAY BUTTON UI CONTROLLER
    // ----------------------------------------
    function updatePlayButton(isPlaying) {
        $("#playPauseBtn").text(isPlaying ? ICON_PAUSE : ICON_PLAY);
    }




    // ---------- REPLAY FLAG ----------
    let replayEnabled = false;




    // ===========================
    // GET INITIAL DATA
    // ===========================
    
    $.get("/api/get-beats", function(data) {
        beats = data.beats || [];
        favoriteBeats = data.favoriteBeats || [];
        localStorage.setItem("favoriteBeats", JSON.stringify(favoriteBeats));

        
        activeList = beats.slice();
        renderBeats(activeList);
        renderDropdown(favoriteBeats);
    });





    // ===========================
    // RENDER DROPDOWN
    // ===========================
    function renderDropdown(list) {
        $("#selectionMenu").empty();
        if(list.length === 0){
            $("#selectionMenu").append(`<div class="dropdown-item disabled">No favorites yet</div>`);
            $("#selectionBtn").text("select a favorite");
        } else {
            list.forEach(name => {
                $("#selectionMenu").append(`
                    <div class="dropdown-item" data-beat="${name}">
                        ${name}
                    </div>
                `);
            });
        }
    }





    // ===========================
    // ADD FAVORITE BEAT
    // ===========================
    function addBeat() {
        const beatName = $("#searchInput").val().trim();
        if (!beatName) {
            alert("Please type beat name");
            return;
        }

        if (favoriteBeats.includes(beatName)) {
            alert("This beat is already added.");
            return;
        }

        $.ajax({
            url: "/api/add-favorite",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ name: beatName }),
            success: function(res) {
                if (res.success) {
                   
                    if (res.beat) {
                        
                        beats.push(res.beat);

                       
                        favoriteBeats.push(res.beat.name);
                        localStorage.setItem("favoriteBeats", JSON.stringify(favoriteBeats));
                        renderDropdown(favoriteBeats);

                        
                        activeList.push(res.beat);
                        appendBeatCard(res.beat);

                        
                        const idx = beats.findIndex(b => b.id === res.beat.id || b.name === res.beat.name);
                        if (idx !== -1) {
                            playBeat(idx);
                            updateInfo(beats[idx]);
                        }
                    } else {
                        
                        const newBeat = beats.find(b => b.name === beatName);
                        if (newBeat) {
                            favoriteBeats.push(newBeat.name);
                            localStorage.setItem("favoriteBeats", JSON.stringify(favoriteBeats));
                            renderDropdown(favoriteBeats);
                            activeList.push(newBeat);
                            appendBeatCard(newBeat);
                        }
                    }
                } else {
                    alert(res.message || "Failed to add beat");
                }
            },
            error: function(xhr, status, error) {
                console.error("Error adding favorite:", error);
                alert("Failed to add beat to favorites.");
            }
        });

        $("#searchInput").val("");
    }

    $("#searchBtn").click(addBeat);
    $("#searchInput").keypress(function(e) {
        if (e.key === "Enter") addBeat();
    });








    // ===========================
    // REMOVE FAVORITE BEAT
    // ===========================
    function removeBeat() {
        const beatName = $("#removeInput").val().trim();
        if (!beatName) {
            alert("Please enter a beat name.");
            return;
        }

        if (!favoriteBeats.includes(beatName)) {
            alert("This beat is not in your favorites.");
            return;
        }

        $.ajax({
            url: "/api/remove-favorite",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ name: beatName }),
            success: function(res) {
                if (res.success) {

                    
                    if (res.favoriteBeats) {
                        favoriteBeats = res.favoriteBeats.slice();
                    } else {
                        favoriteBeats = favoriteBeats.filter(b => b !== beatName);
                    }
                    localStorage.setItem("favoriteBeats", JSON.stringify(favoriteBeats));
                    renderDropdown(favoriteBeats);

                    
                    activeList = activeList.filter(b => b.name !== beatName);
                    $(`#beatList .beat-card--dynamic`).filter(function() {
                        return $(this).find(".beat-name").text() === beatName;
                    }).remove();

                    
                    const playing = (currentIndex !== -1 && beats[currentIndex] && beats[currentIndex].name === beatName);
                    if (playing) {
                        try {
                            audio.pause();
                            audio.currentTime = 0;
                            $("#playPauseBtn").text("▶️ Play");
                            $("#audioSource").attr("src", "");
                        } catch(e) {
                            console.warn("Audio stop failed:", e);
                        }
                        currentIndex = -1;
                    }

                    
                    if ($("#selectionBtn").text() === beatName) {
                        $("#selectionBtn").text("select a favorite");
                    }

                    alert(`${beatName} removed successfully!`);
                } else {
                    alert(res.message || "Failed to remove the beat.");
                }
                $("#removeInput").val("");
            },
            error: function(xhr, status, error) {
                console.error("Error removing favorite:", error);
                alert("Failed to remove beat.");
            }
        });
    }

    $("#removeBtn").click(removeBeat);
    $("#removeInput").keypress(function(e) {
        if (e.key === "Enter") removeBeat();
    });





    // ===========================
    // DROPDOWN TOGGLE
    // ===========================
    $("#selectionBtn").click(function (e) {
        e.stopPropagation();
        $("#selectionMenu").slideToggle(150);
    });

    $(document).click(function (e) {
        if (!$(e.target).closest("#selectionDropdown").length) {
            $("#selectionMenu").slideUp(150);
        }
    });





    // ===========================
    // SELECT FAVORITE → PLAY
    // ===========================
    $(document).on("click", ".dropdown-item", function () {
        let beatName = $(this).data("beat");
        if(!beatName) return;
        $("#selectionBtn").text(beatName);
        $("#selectionMenu").slideUp(150);

        const index = beats.findIndex(b => b.name === beatName);
        if (index !== -1) {
            playBeat(index);
            updateInfo(beats[index]);
        }
    });






    // ===========================
    // RENDER / APPEND BEAT CARDS
    // ===========================
    function renderBeats(list) {
        $("#beatList").empty();
        list.forEach(beat => appendBeatCard(beat));
    }

    function appendBeatCard(beat) {
        const realIndex = beats.findIndex(b => b.name === beat.name);
        const card = $("#beatTemplate").clone();
        card.removeAttr("id");
        card.removeClass("template-hidden");
        card.addClass("beat-card--dynamic");

        card.find(".beat-cover").attr("src", beat.cover_url || "/static/images/beat-thumb.png");
        card.find(".beat-name").text(beat.name);

        card.data("index", realIndex);
        card.css({
            "margin-left": "620px",
            "margin-right": "auto",
            "display": ""
        });

        card.on("click", function (e) {
            e.preventDefault();
            const idx = $(this).data("index");
            if (idx !== -1) {
                playBeat(idx);
                updateInfo(beats[idx]);

            }
        });

        $("#beatList").append(card);
    }







    // ===========================
    // PLAY BUTTON /
    // ===========================
    function playBeat(index) {
      if (index < 0 || index >= beats.length) return;

    currentIndex = index;
    const beat = beats[index];

    $("#selectionBtn").text(beat.name);

    $("#audioSource").attr("src", beat.file);
    audio.load();

    audio.play()
        .then(() => updatePlayButton(true))
        .catch(err => console.warn("Play rejected:", err));
        
    }





    // ===========================
    // PLAY / PAUSE BUTTON /
    // ===========================

    $("#playPauseBtn").click(function () {

    if (currentIndex === -1 && beats.length > 0) {
        playBeat(0);
        updateInfo(beats[0]);
        return;
    }

    if (audio.paused) {
        audio.play()
            .then(() => updatePlayButton(true))
            .catch(err => console.warn(err));
    } else {
        audio.pause();
        updatePlayButton(false);
    }

    });





    // ===========================
    // / NEXT BUTTON /
    // ===========================

    $("#nextBtn").click(function () {
        if (activeList.length === 0 || currentIndex === -1) return;
        let pos = activeList.findIndex(b => b.name === beats[currentIndex].name);
        if (pos < activeList.length - 1) {
            const nextBeat = activeList[pos + 1];
            const realIndex = beats.findIndex(b => b.name === nextBeat.name);
            playBeat(realIndex);
            updateInfo(beats[realIndex]);  

        }
    });




    // ===========================
    // / PREV BUTTON /
    // ===========================

    $("#prevBtn").click(function () {
        if (activeList.length === 0 || currentIndex === -1) return;
        let pos = activeList.findIndex(b => b.name === beats[currentIndex].name);
        if (pos > 0) {
            const prevBeat = activeList[pos - 1];
            const realIndex = beats.findIndex(b => b.name === prevBeat.name);
            playBeat(realIndex);
            updateInfo(beats[realIndex]);
    

        }
    });




    // ===========================
    // / VOLUME /
    // ===========================

    $("#volumeControl").on("input", function () {
        audio.volume = $(this).val();
    });




    // ---------- REPLAY BUTTON HANDLER ----------
    $("#replayBtn").click(function () {
        replayEnabled = !replayEnabled;

        if (replayEnabled) {
            $(this).css("background-color", "#931616");
        } else {
            $(this).css("background-color", "#ff4c4c");
        }
    });




    // ---------- AUDIO ENDED (REPLAY SUPPORT) ----------
    audio.addEventListener("ended", function () {

    if (replayEnabled && currentIndex !== -1) {
        audio.currentTime = 0;
        audio.play();
        updatePlayButton(true);
        return;
    }

    updatePlayButton(false);
    

    });




    function updateInfo(beat) {
        $("#genre").val(beat.genre || "");
        if (Array.isArray(beat.mood))
            $("#mood").val(beat.mood[0] || "");
        else
            $("#mood").val(beat.mood || "");
        $("#bpmMin").val(beat.bpm || "");
        $("#bpmMax").val(beat.bpm || "");
    }

});