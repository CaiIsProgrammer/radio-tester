import React from "react";
import "./styles.css";
import axios from "axios";
export default class App extends React.Component {
  state = {
    audioFile: null,
    source: null,
    ctx: null,
    playing: false,
    count: 0,
    radio: null,
  };
  componentDidMount = async () => {
    let ctx = new AudioContext();
    let { data } = await axios.get("http://localhost:3002/radio/radio/ammount");
    console.log(data);
    this.setState({
      ctx,
      count: data.count,
    });
  };
  onClick = async () => {
    for (let i = 0; i < this.state.count; i++) {
      console.log(Math.floor(i / this.state.count) * 100, i);
      let { data } = await axios.get(
        `http://localhost:3002/radio/radio/by/number/in/list?offset=${i}`
      );
      this.setState({
        radio: data[0],
      });
      console.log(data[0]);
      let value = await this.radio(0);
      if (!value) {
        axios.post("http://localhost:3002/radio/radio/by/number/in/list", {
          audiosrc: data[0].audiosrc,
        });
      }
      console.log(value);
    }
  };

  radio = async (i) => {
    let { audioFile, source, ctx } = this.state;
    if (this.state.audioFile !== null) {
      this.state.audioFile.pause();
    }

    let url = this.state.radio.audiosrc;
    audioFile = new Audio();
    console.log(audioFile);
    audioFile.crossOrigin = "anonymous";

    audioFile.preload = "none";
    audioFile.src = url;
    audioFile.volume = 0;
    audioFile.load();

    let playPromise = audioFile.play();

    if (playPromise !== undefined) {
      let res = await playPromise
        .then((_) => {
          console.log("audio played auto");

          source = ctx.createMediaElementSource(audioFile);
          return true;
          this.setState({
            audioFile,
            source,
            playing: true,
          });
        })
        .catch(async (error) => {
          // Auto-play was prevented
          // Show paused UI.
          console.log(error);
          console.log("playback prevented");
          i++;
          if (i < 10) {
            let res = await this.radio(i);
            return res;
          } else {
            //alert("Try a different Station");
            return false;
          }
        });
      return res;
    }
  };
  render() {
    return (
      <div className="App">
        <h1>Hello CodeSandbox</h1>
        <h2>Start editing to see some magic happen!</h2>
        <button>activate</button>
        <button onClick={this.onClick}>start</button>
      </div>
    );
  }
}
