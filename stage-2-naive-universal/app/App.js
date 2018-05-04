import React from "react";
import background from "./background.jpg";

const RANDOM_FOX_URL = "/api/fox";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { foxSrc: null };
  }
  async componentDidMount() {
    const response = await fetch(RANDOM_FOX_URL);
    const { image: foxSrc } = await response.json();
    this.setState({ foxSrc });
  }
  render() {
    const { foxSrc } = this.state;

    return (
      <main style={{ backgroundImage: `url(${background})` }}>
        <h1>🦊 Random Fox 🦊</h1>
        {foxSrc === null ? <p>Get ready for the fox...</p> : <img src={foxSrc} alt="Fox" />}
      </main>
    );
  }
}
