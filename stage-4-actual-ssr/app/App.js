import React from "react";
import background from "./background.jpg";

const RANDOM_FOX_URL = "http://localhost:3000/api/fox";

export default class App extends React.Component {
  static async getInitialProps() {
    const response = await fetch(RANDOM_FOX_URL);
    const { image } = await response.json();

    return { image };
  }
  render() {
    const { image } = this.props;

    return (
      <main style={{ backgroundImage: `url(${background})` }}>
        <h1>🦊 Random Fox 🦊</h1>
        {image === null ? <p>Get ready for the fox...</p> : <img src={image} alt="Fox" />}
      </main>
    );
  }
}

App.defaultProps = {
  image: null
};
