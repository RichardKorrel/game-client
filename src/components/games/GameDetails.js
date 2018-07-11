import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { getGames, joinGame, updateGame } from "../../actions/games";
import { getUsers } from "../../actions/users";
import { userId } from "../../jwt";
import Paper from "material-ui/Paper";
import Board from "./Board";
import "./GameDetails.css";
import Chat from "./Chat";

class GameDetails extends PureComponent {
  componentWillMount() {
    if (this.props.authenticated) {
      if (this.props.game === null) this.props.getGames();
      if (this.props.users === null) this.props.getUsers();
    }
  }

  joinGame = () => this.props.joinGame(this.props.game.id);

  makeMove = (toRow, toCell) => {
    const { game, updateGame } = this.props;

    console.log("makeMove");

    let rowToFill = null;

    game.board.forEach((row, rowIndex) =>
      row.forEach((cell, cellIndex) => {
        console.log("row/col :", rowToFill + " " + toCell);
        if (cellIndex === toCell && !cell) rowToFill = rowIndex;
      })
    );

    console.log("row/col to fill:", rowToFill + " " + toCell);

    // const board = game.board.map(
    //   (row, rowIndex) => row.map((cell, cellIndex) => {
    //     if (rowIndex === toRow && cellIndex === toCell) return game.turn
    //     else return cell
    //   })
    // )

    const board = game.board.map((row, rowIndex) =>
      row.map((cell, cellIndex) => {
        if (rowIndex === rowToFill && cellIndex === toCell) return game.turn;
        else return cell;
      })
    );
    updateGame(game.id, board);
  };

  render() {
    const { game, users, authenticated, userId } = this.props;

    if (!authenticated) return <Redirect to="/login" />;

    if (game === null || users === null) return "Loading...";
    if (!game) return "Not found";

    const player = game.players.find(p => p.userId === userId);

    let symbolPlayer = null;
    if (player)
      if (player.symbol === "x") {
        symbolPlayer = "symbolPlayer-x";
      } else if (player.symbol === "o") {
        symbolPlayer = "symbolPlayer-o";
      } else {
        symbolPlayer = "symbolPlayer-default";
      }

    const winner = game.players
      .filter(p => p.symbol === game.winner)
      .map(p => p.userId)[0];

    return (
      <Paper className="outer-paper">
        <h1>Game #{game.id}</h1>
        <p>Status: {game.status}</p>
        Your color is: <div className={symbolPlayer} />
        {game.status === "started" &&
          player &&
          player.symbol === game.turn && <div>It's your turn!</div>}
        {game.status === "pending" &&
          game.players.map(p => p.userId).indexOf(userId) === -1 && (
            <button onClick={this.joinGame}>Join Game</button>
          )}
        {winner && <p>Winner: {users[winner].firstName}</p>}
        <hr />
        <div className="board">
          {game.status !== "pending" && (
            <Board board={game.board} makeMove={this.makeMove} />
          )}
        </div>
        <Chat />
      </Paper>
    );
  }
}

const mapStateToProps = (state, props) => ({
  authenticated: state.currentUser !== null,
  userId: state.currentUser && userId(state.currentUser.jwt),
  game: state.games && state.games[props.match.params.id],
  users: state.users
});

const mapDispatchToProps = {
  getGames,
  getUsers,
  joinGame,
  updateGame
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GameDetails);
