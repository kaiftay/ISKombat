window.onload = function() {
    let date = new Date();
    const allowableFps = 24;
    const delta = 1000/allowableFps;
    let fighter1State = "STANDING";
    let fighter1Frame = 0;
    let fighter2State = "STANDING";
    let fighter2Frame = 0;
    const server = new Server(callChallengeCB, isAcceptChallengeCB, renderCB);
    const graph = new Graph();
    const backgroundImg = new Image();
    const standingRight = new Image();
    standingRight.src = "../public/img/standing_r.png";
    const standingLeft = new Image();
    standingLeft.src = "../public/img/standing_l.png";
    const sitLeft = new Image();
    sitLeft.src =  "../public/img/sit_l.png";
    const sitRight = new Image();
    sitRight.src = "../public/img/sit_r.png";
    const hitLegLeft = new Image();
    hitLegLeft.src =  "../public/img/hitLeg_l.png";
    const hitLegRight = new Image();
    hitLegRight.src = "../public/img/hitLeg_r.png";
    const hitLeft = new Image();
    hitLeft.src =  "../public/img/hit_l.png";
    const hitRight = new Image();
    hitRight.src = "../public/img/hit_r.png";
    const walkingLeft = new Image();
    walkingLeft.src =  "../public/img/walking_l.png";
    const walkingRight = new Image();
    walkingRight.src = "../public/img/walking_r.png";
    backgroundImg.src = "../public/img/UDSU.png"
    //TODO: cut all fighter pics, depending on state
    const LEFT_SPRITE = {
        STANDING: {
            width: standingLeft.width/5,
            height: standingLeft.height/3,
            frames: 12,
            cols: 5,
            rows: 3,
            img: standingLeft
        },
        CROUCHING: {
            width: sitLeft.width/2,
            height: sitLeft.height/2,
            frames: 3,
            cols: 2,
            rows: 2,
            img: sitLeft
        },
      HITLEG: {
        width: hitLegLeft.width/2,
        height: hitLegLeft.height/2,
        frames: 3,
        cols: 2,
        rows: 2,
        img: hitLegLeft
      },
      HITARM: {
        width: hitLeft.width/2,
        height: hitLeft.height/2,
        frames: 3,
        cols: 2,
        rows: 2,
        img: hitLeft
      },
      WALKING: {
        width: walkingLeft.width/4,
        height: walkingLeft.height/3,
        frames: 9,
        cols: 4,
        rows: 3,
        img: walkingLeft
      }
    }

    const RIGHT_SPRITE = {
      STANDING: {
        width: standingRight.width/5,
        height: standingRight.height/3,
        frames: 12,
        cols: 5,
        rows: 3,
        img: standingRight
      },
      CROUCHING: {
        width: sitRight.width/2,
        height: sitRight.height/2,
        frames: 3,
        cols: 2,
        rows: 2,
        img: sitRight
      },
      HITLEG: {
        width: hitLegRight.width/2,
        height: hitLegRight.height/2,
        frames: 3,
        cols: 2,
        rows: 2,
        img: hitLegRight
      },
      HITARM: {
        width: hitRight.width/2,
        height: hitRight.height/2,
        frames: 3,
        cols: 2,
        rows: 2,
        img: hitRight
      },
      WALKING: {
        width: walkingRight.width/4,
        height: walkingRight.height/3,
        frames: 9,
        cols: 4,
        rows: 3,
        img: walkingRight
      }
      };

    function getTime(ms) {
        ms = Math.floor(ms / 1000);
        let min = Math.floor(ms / 60);
        let sec = Math.floor(ms - min * 60);
        min = (min < 10) ? `0${min}` : min;
        sec = (sec < 10) ? `0${sec}` : sec;
        return `${min}:${sec}`;
    }

    function render(data) {
        let newDate = new Date();
        if ((newDate - date) < delta) {
            return;
        }
        const fighter1 = data.fighters[0];
        const fighter2 = data.fighters[1];
        if (fighter1State !== fighter1.state) {
            fighter1Frame = 0;
            fighter1State = fighter1.state;
        }
        if (fighter2State !== fighter2.state) {
            fighter2Frame = 0;
            fighter2State = fighter2.state;

        }

        graph.clear();
        graph.sprite(backgroundImg, 0, 0);

        // вывести время
        const { timestamp, startTimestamp, duration } = data.scene;
        graph.textOut(getTime(duration - (timestamp - startTimestamp)), 600, 80);

        // линейки жизни
        graph.lifeBar(fighter1.health - 0, fighter1.x - 0, fighter1.y - 0);
        graph.lifeBar(fighter2.health - 0, fighter2.x - 0, fighter2.y - 0);

        graph.spriteFighter(
            LEFT_SPRITE[fighter1State].img,
            getRegion(fighter1Frame,LEFT_SPRITE[fighter1State], fighter1State !== "CROUCHING"),
            fighter1.x,
            fighter1.y,
            fighter1.state
        );
        graph.spriteFighter(
            RIGHT_SPRITE[fighter2State].img,
            getRegion(fighter2Frame,RIGHT_SPRITE[fighter2State], fighter1State !== "CROUCHING"),
            fighter2.x,
            fighter2.y,
            fighter2.state
        );
        date = newDate;
        fighter1Frame++;
        fighter2Frame++;

    }

    function getRegion(frame, spriteConfig, cyclic){
        if (cyclic) {
            frame = frame % spriteConfig.frames;
        } else {
           frame = frame > spriteConfig.frames ? spriteConfig.frames - 1 : frame;
        }
        return {
            sx:(frame%spriteConfig.cols)*spriteConfig.width,
            sy:(Math.floor(frame/spriteConfig.cols)%spriteConfig.rows)*spriteConfig.height,
            sWidth:spriteConfig.width,
            sHeight:spriteConfig.height
        }
    }

    function renderCB(result) {
        if (result && result.endBattle) {
            server.stopUpdateBattle();
            alert("END! Winner: "+result.winner+", Loser: "+result.loser+".");
            server.deleteFighter();
            showPage("lobbyPage");
            return;
        }
        render(result);
    }

    function callChallengeCB() {
        document.getElementById('challenge').style.display = "block";
        document.getElementById('accept').onclick = async function() {
            const result = await server.acceptChallenge('yes');
            if (result) {
                document.getElementById('challenge').style.display = "none";
                showPage("gamePage");
                server.sendUpdateBattle = true;
                server.updateBattle();
            }
        };
        document.getElementById('decline').onclick = async function() {
            const result = await server.acceptChallenge('no');
            if (result) {
                document.getElementById('challenge').style.display = "none";
                server.sendIsChallenge = true;
                server.startCallChallenge();
            }
        };
    }

    function isAcceptChallengeCB() {
        server.stopCallIsChallengeAccepted();
        showPage('gamePage');
        server.sendUpdateBattle = true;
        server.updateBattle();
    }

    function showPage(name) {
        document.getElementById("authPage").style.display = "none";
        document.getElementById("gamePage").style.display = "none";
        document.getElementById("lobbyPage").style.display = "none";
        document.getElementById(name).style.display = "block";
    }

    function addUserToLobby(user) {
        const div = document.createElement('div');
        div.innerHTML = user.login;
        const button = document.createElement('button');
        button.innerHTML = 'Challenge user';
        button.addEventListener('click', async function() {
            const result = await server.isUserChallenged(user.id);
            if (result) {
                server.stopCallIsChallengeAccepted();
                server.startCallChallenge();
                alert(user.login + " already challenged by someone else!");
            } else {
                server.newChallenge(user.id);
                server.stopCallChallenge();
                server.startCallIsChallengeAccepted();
            }
        });
        document.getElementById('lobbyTable').appendChild(div);
        document.getElementById('lobbyTable').appendChild(button);
    }

    async function initLobbyPage() {
        const users = await server.getAllUsers();
        document.getElementById("lobbyTable").innerHTML = '';
        if (users && users.length) {
            for (var user of users) {
                addUserToLobby(user);
            }
        }
    }

    function initUsernameHeader() {
        const login = document.getElementById("login").value;
        const userLogin = document.createElement('h6');
        userLogin.innerHTML = "ТВОЁ ПОГОНЯЛО: " + login;
        document.getElementById("lobbyHeader").appendChild(userLogin);
    }

    //authorization
    document.getElementById("loginButton").addEventListener("click", async function() {
        const login = document.getElementById("login").value;
        const pass = document.getElementById("pass").value;
        if (login && pass) {
            const result = await server.auth(login, pass);
            if (result) {
                showPage("lobbyPage");
                initUsernameHeader();
                initLobbyPage();
            }
        } else alert("no login or pass");
    });

    document.getElementById("registerButton").addEventListener("click", async function() {
        const login = document.getElementById("login").value;
        const pass = document.getElementById("pass").value;
        if (login && pass) {
            const result = server.register(login, pass);
            if (result) {
                alert("success!");
            }
        } else alert("no login or pass");
    });

    document.getElementById("refreshLobby").addEventListener("click", function() {
        initLobbyPage();
    });

    document.getElementById("logoutButton").addEventListener("click", async function() {
        const result = await server.logout();
        if (result) {
            server.stopUpdateBattle();
            showPage("authPage");
        }
    });
    //game methods
    document.addEventListener('keydown', function(event) {
        if (event.keyCode == 69) { // KeyE
            server.hit("HITARM");
        }
        if (event.keyCode == 81) { // KeyQ
            server.hit("HITLEG");
        }
        if (event.keyCode == 68) { // KeyD
            server.move("right");
        }
        if (event.keyCode == 65) { // KeyA
            server.move("left");
        }
        if (event.keyCode == 83) { // KeyS
              server.setState("CROUCHING");
        }
        if (event.code === 'KeyA' || event.code === 'KeyD') {
          server.setState("WALKING");
        }
    });
    document.addEventListener('keyup', function(event) {
            server.setState("STANDING");
    });
    /*
    document..addEventListener('click', async function () {
        console.log(await server.hit("HITARM"));
    });

    document.getElementById('hit_leg').addEventListener('click', async function () {
        console.log(await server.hit(0, "LEGKICK"));
    });

    document.getElementById('stand').addEventListener('click', async function () {
        console.log(await server.setState(0, "STANDING_LEFT"));
    });

    document.getElementById('crouch').addEventListener('click', async function () {
        console.log(await server.setState(0, "CROUCHING"));
    });

    document.getElementById('jump').addEventListener('click', async function () {
        console.log(await server.setState(0, "JUMP"));
    });
    */
    document.getElementById("exitBattle").addEventListener("click", async function() {
        const result = server.deleteFighter();
        if (result) {
            server.stopUpdateBattle();
            showPage("lobbyPage");
        }
    });

    showPage("authPage");
};