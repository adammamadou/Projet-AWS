const express = require ('express')
const config = require ('config')
const mongoose = require('mongoose')
const app = express()
const socketio = require('socket.io');
const path = require('path')
const http = require('http');

app.use(express.json({extended: true}))

app.use('/api/auth', require('./routes/auth.routes'))
const server = http.createServer(app);
const io = socketio(server);


if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static(path.join(__dirname, 'client', 'build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

const PORT = process.env.PORT || 4000
let games = [];
let nextGameId = 0;

async function start() {
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })

        const getGames = () => { //recupère la partie (nombre joueurs,emplacement ...)
            return games.map((g) => {
                const { players, ...game } = g;
                return {
                ...game,
                numberOfPlayers: players.length,
                };
            })
        }

        const getGameById = (gameId) => { //chercher une partie deja crée 
            return getGames().find((game)=> game.id === gameId) 
        }

        const getGameForPlayer = (player) => { 
            return games.find((g) =>
                g.players.find((p) => p.socket === player)
            );
        };


        const addPlayerToGame = ({ player, gameId }) => {
            const game = games.find((game)=> game.id === gameId)
            game.players.push({
            socket: player,
            });
        }

        const sendGames = (sender) => {
            return sender.emit('games', getGames());
        };

        const createGame = ({ player, name }) => {
            const game = {
                name,
                turn: 'a',
                players: [
                {
                    socket: player,
                },
                ],
                id: nextGameId++,
                // board: [
                        // definition du shemas de jeux
                // ],
            
            };
            games.push(game);
            return game;
            
        }

        const endGame = ({ player, winner}) => {
            const game = getGameForPlayer(player);
            if (!game) return;
            games.splice(games.indexOf(game), 1);
            game.players.forEach((currentPlayer) => {
            if (winner) currentPlayer.socket.emit('winner', winner);
            });
        }

        io.on('connection', socket => {
            socket.emit('games', getGames());
            socket.on('create-game', (name) => {
                const game = createGame({player: socket, name})  
                sendGames(io);
                socket.emit('your-game-created', game.id);
            })

            socket.on('join-game', (gameId) => {
                const game = getGameById(gameId);
                if (game.numberOfPlayers < 2) {
                    const partie = addPlayerToGame({
                        player: socket,
                        gameId,
                    });
                    sendGames(io);
                  
                }
                sendGames(io);
            })
            socket.on('action', ({selectedPiece, destination,}) => {
                const game = getGameForPlayer(socket);
                movePiece({ game, selectedPiece, destination});
                const winner = isGameOver({ player: socket });
    
                if (winner !== false) {
                    endGame({ player: socket, winner });
                }
                sendGames(io);
                })
          
            socket.on('disconnect', () => {
                endGame({ player: socket });
                sendGames(io);
            });
            socket.on('leave-game', () => {
                endGame({ player: socket });
                sendGames(io);
            })
        });

        server.listen(PORT, function(){
            console.log(`Server started on port ${PORT}`)
        });
        
    } catch (e) {
        console.log('server errorr', e.message)
        process.exit(1)
    }
}

start ()
