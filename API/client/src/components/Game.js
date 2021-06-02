import React, { useEffect, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import '../Game.css';
import chat from './chat';
import io from 'socket.io-client';


export default function Game({ leaveGame, game, name}) {
  const [selectedPiece, setSelectedPiece] = useState({});
  useEffect(() => {
    return () => leaveGame();
  }, []);

  const selectPiece = (a) => {
    if (game.turn !== name) return;
    setSelectedPiece();
  };

  

  const renderBoard = () => {
    return (
      <div>
        <center>
       <Games/>
      </center> 
      </div> 
    );
  };

  const isGameStarted = () => game.numberOfPlayers === 2;

  const renderWaiting = () => {
    return (
      <Col>
        <div className="text-center">
          <h2 className="mb-4">{game.name}</h2>
          <div className="mb-4">
            <Spinner animation="border" role="status" />
          </div>
          <span>attente de l'adversaire!!!</span>
        </div>
      </Col>
    );
  };

  const renderGame = () => {
    return (
      <>
        <Col>
          {renderBoard()}
        </Col>
      </>
    );
  };
  return (
    <Row>
       {!isGameStarted() && renderWaiting()}
       {isGameStarted() && renderGame()} 
    </Row>
  );
}
//-----------------------------------

function entierAleatoire(min, max)
{
 return Math.floor(Math.random() * (max - min + 1)) + min;
}
var entier = entierAleatoire(1, 20);

function entierAleatoireB(min, max)
{
 return Math.floor(Math.random() * (max - min + 1)) + min;
}
var entierB = entierAleatoireB(1, 20);




class Games extends React.Component{
  constructor(props){
      super(props);
      this.state={
          nom_a: "Perso_A",
          force_a: 0,
          vie_a: 100,
          nom_b: "Perso_B",
          force_b: 0,
          vie_b: 100,
          tour_joueur : 'a'
      }
      this.frapper = this.frapper.bind(this);
      this.dormir = this.dormir.bind(this);
      this.reset = this.reset.bind(this);
  }
  reset(){
      document.location.reload(true);
  }
  
  frapper(event){
      if(this.state.tour_joueur === 'a'){
          this.setState(
              state => ({force_a: state.force_a +entier, vie_b: state.vie_b -entier, tour_joueur: 'b'})
      );
      }else{
          this.setState(
              state => ({force_b: state.force_b +entierB, vie_a: state.vie_a -entierB, tour_joueur: 'a'})
          );
      }
  }
  dormir(){
      if(this.state.tour_joueur === 'a'){
          this.setState(
              state => ({force_a: state.force_a -entier, vie_a: state.vie_a +entier, tour_joueur: 'b'})
          );
      }else{
          this.setState(
              state => ({force_b: state.force_b -entierB, vie_b: state.vie_b +entierB, tour_joueur: 'a'})
          );
      }
  }
  render(){
      if(this.state.tour_joueur === 'a'){
          var tour = "Tour : Joueur A"
          var classeA ="btn btn-primary w-100 mb-3 ";
          var classeB ="d-none";
      }else{
          var tour = "Tour : Joueur B"
          var classeA ="d-none";
          var classeB ="btn btn-primary w-100 mb-3";
      }
      if(this.state.vie_a <= 0){
          var classeA ="btn btn-primary w-100 mb-3 disabled";
          var classeB ="btn btn-primary w-100 mb-3 disabled";
          var gagne ="Le joueur B à gagner"
          var tour='';
          var elem = document.getElementById("carte_joueur");
          var diabled=true
      }
      if(this.state.vie_b <= 0){
          var classeA ="btn btn-primary w-100 mb-3 disabled";
          var classeB ="btn btn-primary w-100 mb-3 disabled";
          var gagne ="Le joueur A à gagner"
          var tour='';
          var elem = document.getElementById("carte_joueur");
          var diabled=true
      }

      if(this.state.vie_a > 50){
          var classeVieA ="progress-bar bg-success";
      }
      if(this.state.vie_a <= 50){
          var classeVieA ="progress-bar bg-warning";
      }

      if(this.state.vie_a < 40){
          var classeVieA ="progress-bar bg-danger";
      }

      if(this.state.vie_b > 50){
          var classeVieB ="progress-bar bg-success";
      }

      if(this.state.vie_b <= 50){
          var classeVieB ="progress-bar bg-warning";
      }

      if(this.state.vie_b < 40){
          var classeVieB ="progress-bar bg-danger";
      }


      const divStyleA = {
          width: this.state.vie_a+'%',
        };

        const divStyleB = {
          width: this.state.vie_b+'%',
        };
      return(
      <React.Fragment align="center">
       <div className="col-12">
        <h1 className="text-success">{gagne}</h1>
        <h1>{tour}</h1>
      </div>
      <div id="carte_joueur" class="row mx-auto"> 
          <div className="card col-4 mt-1">
                  <img src="https://media.giphy.com/media/tgWX6N4nHQjNC/giphy.gif" className="card-img-top" alt="..."/>
                  <div className="card-body">
                      <h5 className="card-title">{this.state.nom_a}</h5>
                      <p className="card-text">
                      <ul className="list-unstyled">
                          <li>
                              <div className="progress">
                                  <div className={classeVieA} role="progressbar" style={divStyleA} aria-valuenow={this.state.vie_a} aria-valuemin="0" aria-valuemax="100">{this.state.vie_a}%</div>
                              </div>
                          </li>
                          <li>
                              Force : {this.state.force_a} 
                          </li>
                          </ul>
                      </p>
                      <button disabled ={diabled} className={classeA} onClick={this.frapper}>Attack</button>
                      <button disabled ={diabled} className={classeA}  onClick={this.dormir}>Defense</button>
                  </div>
          </div>

          <div  className="card col-4 mt-1" >
                  <img src="https://66.media.tumblr.com/e36d4244b23330c10dd3c01d378832d5/tumblr_mw3rurB3751s20ivko1_500.gif" className="card-img-top" alt="..."/>
                  <div className="card-body" align="center">
                      <h5 className="card-title">{this.state.nom_b}</h5>
                      <p className="card-text">
                      <ul className="list-unstyled">
                          <li>
                              <div className="progress">
                                  <div className={classeVieB} role="progressbar" style={divStyleB} aria-valuenow={this.state.vie_b} aria-valuemin="0" aria-valuemax="100">{this.state.vie_b}%</div>
                              </div>
                          </li>
                          <li>
                              Force : {this.state.force_b} 
                          </li>
                          </ul>
                      </p>
                      <button disabled ={diabled} className={classeB} onClick={this.frapper}>Attack</button>
                      <button disabled ={diabled} className={classeB}  onClick={this.dormir}>Defense</button>
                  </div>
          </div>
          <div>
            {chat}
          </div>
      </div>
      </React.Fragment>
      )
  }
}


