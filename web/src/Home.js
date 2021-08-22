import React, { Suspense } from "react";
import "./Home.css";
import Typewriter from "typewriter-effect";
import { Link } from "react-scroll";
import SwipeableTextMobileStepper from "./components/swipeableTextMobileStepper";
import introImg from "./importIntroImg";
import Youtube from "./components/Youtube.js";
import LazyLoad from "./components/LazyLoad.js";
import FadeInSection from "./components/FadeInSection.js";
const cardPlayVideo = React.lazy(() => import("./videos/cardsplay.mp4"));

function Home(props) {
  return (
    <div id="home" className="Home">
      <div className="topbarOuterContainer">
        <div className="topbarContainer">
          <Link to="home" spy={true} smooth={true}>
            <button className="topbtn">Home</button>
          </Link>
          <Link to="features" spy={true} smooth={true}>
            <button className="topbtn">Features</button>
          </Link>
          <Link to="about" spy={true} smooth={true}>
            <button className="topbtn">About</button>
          </Link>
          <Link to="tutorial" spy={true} smooth={true}>
            <button className="topbtn">Tutorial</button>
          </Link>
        </div>
      </div>
      <div className="titleContainer">
        <Typewriter
          options={{
            strings: [
              "Floating Bridge",
              "Free, unlimited",
              "Play with friends",
            ],
            autoStart: true,
            loop: true,
          }}
        />
      </div>
      <div className="playbtnContainer">
        <button
          className="playbtn"
          data-descr="Let's go!"
          onClick={props.openLoginPage}
        ></button>
      </div>

      <Suspense fallback={<div></div>}>
        <video autoPlay muted loop className="video">
          <source src={cardPlayVideo} />
        </video>
      </Suspense>

      <div className="spacer"></div>
      <FadeInSection>
        <div id="features" className="textContainer">
          <p className="textContainerTitle">Features</p>
          <SwipeableTextMobileStepper />
          {false && (
            <div className="imgStack">
              {introImg.map((imgSrc, index) => (
                <LazyLoad paddingTop="0">
                  <img
                    className="imgCard"
                    key={index}
                    alt="bgImg"
                    src={imgSrc}
                    width="auto"
                    height="100%"
                  ></img>
                </LazyLoad>
              ))}
            </div>
          )}
        </div>
      </FadeInSection>
      <FadeInSection>
        <div id="about" className="textContainer">
          <p className="textContainerTitle">About</p>
          <p>
            Floating Bridge is a re-invention of the traditional game of
            contract bridge. There are many variations to the game which is
            primarily social, has no official book of rules and no formal
            organizing authority.
          </p>

          <p>
            Players assume fixed seats, but unlike contract bridge, the partners
            are not determined at the outset by virtue of north-south or
            east-west — they are determined at the end of the bidding. Using a
            standard 52-card deck, each player is dealt thirteen cards. There is
            a round of bidding to establish who is declarer, the trump suit, if
            any, and the number of tricks to be taken by declarer. Declarer then
            announces the rank and suit of a card and the holder of that card
            becomes declarer's undisclosed partner. Either declarer or the
            player on his left makes the first lead and normal trick-taking play
            ensues. Although declarer and his partner cooperate to take the most
            tricks, the partner does not immediately identify himself,
            strategically playing to tricks to assist declarer and revealing
            himself only by inference from the play.
          </p>

          <p>
            There are no pre-determined number of deals or games to be played
            and hands are not duplicated for subsequent players, if any. Scoring
            may be by deals-won totals or the total of tricks won in successful
            contracts. Since partnerships change, players accumulate their
            individual scores to determine an overall winner.
          </p>
        </div>
      </FadeInSection>
      <FadeInSection>
        <div id="tutorial" className="textContainer">
          <p className="textContainerTitle">Tutorial</p>
          <p>
            The following video by "That's So Singapore!!" provides a very
            detailed yet easy-to-follow explanation on how to play floating
            bridge. Do give it a go!
          </p>
          <Youtube />
        </div>
      </FadeInSection>
      <div className="botbarContainer">
        <a
          className="creditsText"
          rel="nofollow"
          target="_blank"
          href="http://videezy.com"
        >
          Credits
        </a>
      </div>
    </div>
  );
}

export default Home;
