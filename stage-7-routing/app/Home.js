import React from "react";
import background from "./background.jpg";

const RANDOM_FOX_URL = "http://localhost:3000/api/fox";

export default class Home extends React.Component {
  static async getInitialProps() {
    const response = await fetch(RANDOM_FOX_URL);
    const { image: foxSrc } = await response.json();

    return { foxSrc };
  }
  render() {
    const { foxSrc } = this.props;

    return (
      <main style={{ backgroundImage: `url(${background})` }}>
        <h1>🦊 Random Fox 🦊</h1>
        {foxSrc === null ? <p>Get ready for the fox...</p> : <img src={foxSrc} alt="Fox" />}
        <a href="/imprint">Imprint</a>
      </main>
    );
  }
}

Home.defaultProps = {
  foxSrc: null
};
