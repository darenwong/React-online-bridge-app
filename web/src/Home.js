import React from 'react';
import {Link as PageLink} from 'react-router-dom';
import './Home.css';
import cardPlayVideo from './videos/cardsplay.mp4';
import iosLogo from './images/appstore.png';
import Typewriter from 'typewriter-effect';
import {Link} from 'react-scroll'
function Home(props) {
    return (
        <div id='home' className="Home">
            <div className='topbarOuterContainer'>
                <div className="topbarContainer">
                    <Link to = 'home' spy={true} smooth={true}>
                        <button className="topbtn">Home</button>
                    </Link>
                    <Link to = 'about' spy={true} smooth={true}>
                        <button className="topbtn">About</button>
                    </Link>
                    <Link to = 'howtoplay' spy={true} smooth={true}>
                        <button className="topbtn">How To Play</button>
                    </Link>
                    <div>
                        <button className="topbtn">Login</button>
                    </div>
                </div>
            </div>
            <div className='titleContainer'>
                <Typewriter
                    options={{
                        strings: ['Floating Bridge', 'Free, unlimited', 'Play with friends'],
                        autoStart: true,
                        loop: true,
                    }}
                />
            </div>
            <div className='playbtnContainer'>
                <PageLink to = '/app'>
                    <button className='playbtn' data-descr="Let's go!"></button>
                </PageLink>
            </div>
            <video autoPlay muted loop className="video">
                <source src={cardPlayVideo} />
            </video>

            <div className='spacer'>Test</div>
            
            <div id='about' className='textContainer'>
                <h1 style={{marginBottom:'1rem'}}>About</h1>
                <p>Floating Bridge is a re-invention of the traditional game of contract bridge. There are many variations to the game which is primarily social, has no official book of rules and no formal organizing authority.</p>
  
                <p>Players assume fixed seats, but unlike contract bridge, the partners are not determined at the outset by virtue of north-south or east-west — they are determined at the end of the bidding. Using a standard 52-card deck, each player is dealt thirteen cards. There is a round of bidding to establish who is declarer, the trump suit, if any, and the number of tricks to be taken by declarer. Declarer then announces the rank and suit of a card and the holder of that card becomes declarer's undisclosed partner. Either declarer or the player on his left makes the first lead and normal trick-taking play ensues. Although declarer and his partner cooperate to take the most tricks, the partner does not immediately identify himself, strategically playing to tricks to assist declarer and revealing himself only by inference from the play.</p>

                <p>There are no pre-determined number of deals or games to be played and hands are not duplicated for subsequent players, if any. Scoring may be by deals-won totals or the total of tricks won in successful contracts. Since partnerships change, players accumulate their individual scores to determine an overall winner.
                </p>
            </div>

            <div id='howtoplay' className='textContainer'>
                <h1 style={{marginBottom:'1rem'}}>How To Play</h1>
                <p>Please watch the video below to learn how to play.</p>
                <div className='videoContainer'>
                    <iframe 
                        width="560" 
                        height="315" 
                        src="https://www.youtube.com/embed/NUTi2r4u2-g" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        title='video'
                    />
                </div>
            </div>

            <div className='botbarContainer'>
                <img className='image' src={iosLogo} alt="iosimage"/>
                <a className='creditsText' rel="nofollow" target="_blank" href="http://videezy.com">Footage credits to Videezy</a>
            </div>
        </div>
    );
}

export default Home;