$(document).ready(function () {

   



    // ----------------------------------------
    // ICON CONSTANTS
    // ----------------------------------------
    const ICON_PLAY  = "▶";
    const ICON_PAUSE = "⏸";





    // ----------------------------------------
    // 1) Beat Data
    // ----------------------------------------
    const beats = [
       
        { name: "F♯ Minor Emotional Beat", 

        file: "static/beats/beat-1.wav", 

        genre: "trap", 

        mood: ["chill"], 

        bpm: 100 },
        


        { name: "C Minor Emotional Beat", 

        file: "static/beats/beat-2.wav", 

        genre: "drill", 

        mood: ["dark"], 

        bpm: 136 },
       


        { name: "A Minor Emotional Beat", 

        file: "static/beats/beat-3.wav", 

        genre: "lofi", 

        mood: ["chill"], 

        bpm: 121 },
       


        { name: "D♯ Minor Emotional Beat", 

        file: "static/beats/beat-4.wav", 

        genre: "trap", 

        mood: ["happy"], 

        bpm: 108 },
       


        { name: "D Minor Emotional Beat", 

        file: "static/beats/beat-5.wav", 

        genre: "lofi", 

        mood: ["sad"], 

        bpm: 124 },
       


        { name: "A Major Emotional Beat", 

        file: "static/beats/beat-6.wav", 

        genre: "lofi", 

        mood: ["chill"], 

        bpm: 78 },
       


        { name: "C♯ Minor Emotional Beat", 

        file: "static/beats/beat-7.wav", 

        genre: "trap", 

        mood: ["dark"], 

        bpm: 70 },
      


        { name: "A Major Emotional Beat 2", 

        file: "static/beats/beat-8.wav", 

        genre: "trap", 

        mood: ["happy"], 

        bpm: 89 },
   


       { name: "C♯ Minor Emotional Beat 2",
   
         file: "static/beats/beat-9.wav",
    
         genre: "lofi",
    
         mood: ["sad"],
    
         bpm: 78 },



       { name: "E♭ Major Emotional Beat",
    
         file: "static/beats/beat-10.wav",
    
         genre: "hip-hop",
    
         mood: ["happy"],
    
         bpm: 107 },



       { name: "C Minor Emotional Beat 2",
    
        file: "static/beats/beat-11.wav",
    
        genre: "drill",
    
        mood: ["dark"],
    
        bpm: 142 },


       
       { name: "D Major Emotional Beat",
    
         file: "static/beats/beat-12.wav",
    
         genre: "hip-hop",
    
         mood: ["chill"],
    
         bpm: 81 },



        { name: "C♯ Minor Emotional Beat 3",
          
          file: "static/beats/beat-13.wav",
    
          genre: "lofi",
    
          mood: ["happy"],
    
          bpm: 75 },



        { name: "A♯ Minor Emotional Beat",
    
          file: "static/beats/beat-14.wav",
    
          genre: "trap",
    
          mood: ["dark"],
    
          bpm: 73 },



        { name: "G♯ Minor Emotional Beat",
    
          file: "static/beats/beat-15.wav",
    
          genre: "trap",
    
          mood: ["dark"],
    
          bpm: 119 },



        { name: "D♯ Minor Emotional Beat 2", 
    
          file: "static/beats/beat-16.wav",
    
          genre: "trap", 
    
          mood: ["sad"],
    
          bpm: 82 },



        { name: "A♯ Minor Emotional Beat 2",
    
          file: "static/beats/beat-17.wav",
    
          genre: "trap",
    
          mood: ["dark"],
    
          bpm: 107 },



        { name: "C Minor Emotional Beat 3", 
    
          file: "static/beats/beat-18.wav",
    
          genre: "drill",
    
          mood: ["dark"],
    
          bpm: 77 },



        { name: "D Minor Emotional Beat 2", 
    
          file: "static/beats/beat-19.wav",
    
          genre: "hip-hop", 
    
          mood: ["dark"],
    
          bpm: 128 },



        { name: "D Minor Emotional Beat 3", 
    
         file: "static/beats/beat-20.wav",
    
         genre: "trap",
    
         mood: ["dark"],  
    
         bpm: 70, }, 



        { name: "C Minor Emotional Beat 4",  
    
         file: "static/beats/beat-21.wav", 
    
         genre: "drill", 
    
         mood: ["dark"],  
    
         bpm: 74, },



         { name: "F Minor Emotional Beat",  
    
         file: "static/beats/beat-22.wav", 
    
         genre: "trap", 
    
         mood: ["happy"],  
    
         bpm: 100, },



        { name: "C♯ Minor Emotional Beat 4", 

        file: "static/beats/beat-23.wav", 

        genre: "trap", 

        mood: ["dark"], 

        bpm: 107, }


        ];

  



    let currentIndex = -1;
    let activeList = beats;
    const audio = $("#audioPlayer")[0];

   




    // ----------------------------------------
    // 2) Update Info Panel
    // ----------------------------------------
    function updateInfo(beat) {
        $("#genre").val(beat.genre);
        if (Array.isArray(beat.mood))
            $("#mood").val(beat.mood[0]);
        else
            $("#mood").val(beat.mood);
        $("#bpmMin").val(beat.bpm);
        $("#bpmMax").val(beat.bpm);
    
    
         $("#beatName").text(beat.name);
     }

    

    

    // ----------------------------------------
    // 3) Render Beats (clone template)
    // ----------------------------------------
    function renderBeats(list) {
        activeList = list;
        $("#beatList").empty();

        list.forEach((beat) => {
            const originalIndex = beats.findIndex(b => b.name === beat.name && b.file === beat.file);
            let card = $("#beatTemplate").clone();
            card.removeAttr("id");
            card.removeClass("template-hidden");
            card.find(".beat-name").text(beat.name);
            card.data("index", originalIndex);
            card.css({ "margin-left": "620px", "margin-right": "auto", "display": "" });
            card.on("click", function (e) {
                e.preventDefault();
                const idx = $(this).data("index");
                playBeat(idx);
                updateInfo(beats[idx]);
            });
            $("#beatList").append(card);
        });

        if (list.length === 1) {
            const idx = beats.findIndex(b => b.name === list[0].name && b.file === list[0].file);
            if (idx !== -1) {
                updateInfo(beats[idx]);
                currentIndex = idx;

            $("#audioSource").attr("src", beats[idx].file);
            audio.load();
            
            }
        }
    }

    renderBeats(beats);

   


    // ----------------------------------------
    // 4) Play a Beat
    // ----------------------------------------
    function playBeat(index) {
    if (index < 0 || index >= beats.length) return;

    currentIndex = index;
    const beat = beats[index];

    $("#audioSource").attr("src", beat.file);
    audio.load();
    audio.play().catch(() => {});

    $("#playPauseBtn").text(ICON_PAUSE);
    updateInfo(beat);
    
    }

   


    // ----------------------------------------
    // 5) Play / Pause Button
    // ----------------------------------------
    $("#playPauseBtn").click(function () {
    if (activeList.length === 0) return;

    
    if (currentIndex === -1) {
        const firstBeat = activeList[0];
        const realIndex = beats.findIndex(
            b => b.name === firstBeat.name && b.file === firstBeat.file
        );

        if (realIndex !== -1) {
            playBeat(realIndex);
        }
        return;
    }

    if (audio.paused) {
        audio.play().catch(() => {});
        $(this).text(ICON_PAUSE);
    } else {
        audio.pause();
        $(this).text(ICON_PLAY);
    }
});
   




    // ----------------------------------------
    // Replay Button
    // ----------------------------------------

    $("#replayBtn").click(function () {
      $(this).toggleClass("active");
        if ($(this).hasClass("active")) {
          $(this).css("background-color", "rgb(147, 22, 22)");
      } else {
        $(this).css("background-color", "");
      }
     
     });




    // ----------------------------------------
    // 6) Next / Prev Buttons
    // ----------------------------------------
    $("#nextBtn").click(function () {
        if (activeList.length === 0) return;
        let pos = activeList.findIndex(b => b.name === beats[currentIndex].name);
        if (pos < activeList.length - 1) {
            const nextBeat = activeList[pos + 1];
            const realIndex = beats.findIndex(b => b.name === nextBeat.name);
            playBeat(realIndex);
            updateInfo(beats[realIndex]);
        }
    });

    $("#prevBtn").click(function () {
        if (activeList.length === 0) return;
        let pos = activeList.findIndex(b => b.name === beats[currentIndex].name);
        if (pos > 0) {
            const prevBeat = activeList[pos - 1];
            const realIndex = beats.findIndex(b => b.name === prevBeat.name);
            playBeat(realIndex);
            updateInfo(beats[realIndex]);
        }
    });

   


    // ----------------------------------------
    // 7) Volume Control
    // ----------------------------------------
    $("#volumeControl").on("input", function () {
        audio.volume = $(this).val();
    });

    




    // ----------------------------------------
    // 8) Audio Ended Event
    // ----------------------------------------
    audio.addEventListener("ended", function () {
      if ($("#replayBtn").hasClass("active")) {
        audio.currentTime = 0;
        audio.play();
        return;
    }

    
    $("#playPauseBtn").text(ICON_PLAY);
    
    });
    




    // ----------------------------------------
    // 9) Search
    // ----------------------------------------
$("#searchBtn").click(function () {
    let keyword = $("#searchInput").val().toLowerCase().trim();
    let exactMatch = beats.filter(beat => beat.name.toLowerCase() === keyword);
    let results = [];

    if (exactMatch.length > 0) {
        results = exactMatch;
    } else {
        results = beats.filter(beat => beat.name.toLowerCase().includes(keyword) || (beat.genre && beat.genre.toLowerCase().includes(keyword)));
    }

    renderBeats(results);
    currentIndex = -1;





    // NO RESULTS FOUND
    if (results.length === 0) {
        $("#no-results").show();
    } else {
        $("#no-results").hide();
    }
});


$("#searchInput").on("keyup", function (e) {
    if (e.key === "Enter") $("#searchBtn").click();
});
   




    // ----------------------------------------
    // 10) Filters (genre, mood, bpm)
    // ----------------------------------------
    function applyFilters() {
        let genre = $("#genre").val();
        let mood = $("#mood").val();
        let min = Number($("#bpmMin").val());
        let max = Number($("#bpmMax").val());

        let filtered = beats.filter(b => {
            if (genre && b.genre !== genre) return false;
            if (mood) {
                if (Array.isArray(b.mood)) {
                    if (!b.mood.includes(mood)) return false;
                } else if (b.mood !== mood) return false;
            }
            if (!isNaN(min) && b.bpm !== min) return false;
            if (!isNaN(max) && b.bpm !== max) return false;
            return true;
        });

        renderBeats(filtered);
        currentIndex = -1;
    }

    $("#genre, #mood, #bpmMin, #bpmMax").on("change keyup", applyFilters);

});



