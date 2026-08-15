import React from 'react';
import Album from './components/Album';
import aboutPic from './assets/portfolio/DSC02249.jpg';
import featuredPic from './assets/portfolio/DSC07820.jpg';

const signGuestbook = () => {
  alert(
    'The guestbook CGI script is down AGAIN.\n\nPlease email me instead: kevin (at) rooftop-hideout (dot) com\n\n(remove the birds. the birds are for the spambots.)'
  );
};

const viewGuestbook = () => {
  alert('You are already viewing it!\n\nThat is the whole guestbook.\nPlease tell your friends.');
};

function App() {
  return (
    <div className="page">
      <div className="masthead">
        <h1>
          <span className="l1">*~*</span> <span className="l7">KEVIN'S</span>{' '}
          <span className="l3">ROOFTOP</span> <span className="l4">HIDEOUT</span>{' '}
          <span className="l1">*~*</span>
        </h1>
        <div className="tagline">a page about climbing up high &amp; taking pictures of it</div>
        <div className="marquee-box">
          <span>
            +++ WELCOME to my little corner of the World Wide Web !!! +++ Last updated: August 15,
            1998 +++ NEW: six photos from the antenna climb +++ sign my guestbook or the counter
            resets (not really) +++
          </span>
        </div>
      </div>

      <div className="navbar">
        [ <a href="#about">ABOUT ME</a> | <a href="#potm">PHOTO of the MONTH</a> |{' '}
        <a href="#album">MY PHOTO ALBUM</a> | <a href="#news">NEWS</a> |{' '}
        <a href="#gb">GUESTBOOK</a> ]
      </div>

      <div className="counter-row">
        You are visitor number{' '}
        <span className="digits">
          <b>0</b><b>1</b><b>6</b><b>4</b><b>2</b><b>8</b>
        </span>{' '}
        since March 12, 1998 &nbsp;<span className="blink">WOW!</span>
      </div>

      <div className="rainbow-rule" />

      <div className="section-bar" id="about">&#9733; About Me</div>
      <div className="cell-yellow">
        <div className="me-pic">
          <img
            src={aboutPic}
            alt="Kevin standing near the edge of a rooftop above old downtown skyscrapers"
            width="200"
          />
          yes, that is ME up there.<br />(hi mom. do not look at this picture)
        </div>
        <p>
          Hi!! My name is <b>Kevin</b> and this is my home page. By day I stare at spreadsheets in a
          beige cubicle. By night I climb a LOT of stairs (and sometimes ladders) to bring YOU
          pictures of the city from places the city would prefer I was not.
        </p>
        <p>
          If a photo takes a minute to load on your modem, that is called <i>anticipation</i>.
        </p>
      </div>

      <div className="section-bar" id="potm">
        &#9733; Photo of the Month <span className="new-flag">NEW!</span>
      </div>
      <div className="potm">
        <img
          src={featuredPic}
          alt="Lightning bolts splitting the sky over a glowing greenhouse and city buildings"
          width="480"
        />
        <div className="cap">
          <b>August 1998: "CAUGHT THE LIGHTNING!!!"</b>
          <br />
          Three nights at the window with the shutter open. On the third night the sky cooperated.
          <br />
          <a href={featuredPic} target="_blank" rel="noopener noreferrer">
            click here for the BIG version (214 KB &mdash; worth it!!)
          </a>
        </div>
      </div>

      <div className="section-bar" id="album">&#9733; My Photo Album &mdash; Page 1 of 1 (so far!)</div>
      <Album />

      <div className="section-bar" id="news">&#9733; News &amp; Updates</div>
      <div className="cell-yellow updates">
        08/15/98 &mdash; Added SIX new photos from the antenna climb!!{' '}
        <span className="new-flag">NEW!</span>
        <br />
        06/19/98 &mdash; Removed some photos. (you know why. THEY know why.)
        <br />
        03/12/98 &mdash; Kevin's Rooftop Hideout is LIVE on the World Wide Web!
      </div>

      <div className="section-bar" id="gb">&#9733; My Guestbook</div>
      <div className="cell-yellow">
        <div className="gb-entry">
          "cool page kevin!! the lightning picture is AWESOME. how many tries?"
          <br />
          <span className="who">&mdash; Sandra, 08/12/98, 11:42 PM</span>
        </div>
        <div className="gb-entry">
          "how did you get on that roof. asking for myself. please email me back"
          <br />
          <span className="who">&mdash; mike_t, 08/03/98, 2:17 AM</span>
        </div>
        <p style={{ textAlign: 'center', marginTop: '12px' }}>
          <button className="btn95" type="button" onClick={signGuestbook}>
            Sign My Guestbook!
          </button>{' '}
          <button className="btn95" type="button" onClick={viewGuestbook}>
            View My Guestbook
          </button>
        </p>
      </div>

      <div className="rainbow-rule" />

      <div className="webring">
        <b>~ The Night Owls Photography WebRing ~</b>
        <br />
        This site is owned by <b>KEVIN</b> (site #47).
        <br />
        [ <a href="#gb" title="previous site is on a lunch break">&lt;&lt; Prev</a> |{' '}
        <a href="#gb" title="random site is on a lunch break">Random</a> |{' '}
        <a href="#gb" title="the list is on a lunch break">List Sites</a> |{' '}
        <a href="#gb" title="next site is on a lunch break">Next &gt;&gt;</a> ]
      </div>

      <div className="badges">
        <span className="badge b1">BEST VIEWED<br />800 x 600</span>
        <span className="badge b2">NETSCAPE 4.0<br />APPROVED-ish</span>
        <span className="badge b3">MADE WITH<br />NOTEPAD.EXE</span>
        <span className="badge b5">Y2K STATUS:<br />NERVOUS</span>
      </div>

      <div className="uc-text">&#9888; This page is ALWAYS under construction &#9888;</div>
      <div className="uc-stripes" />

      <div className="footer">
        &copy; 1997&ndash;1998 Kevin. All photos taken by ME. Email the webmaster:{' '}
        <b>kevin (at) rooftop-hideout (dot) com</b>
        <br />
        <span className="host">
          This page proudly hosted by <b>WebTown&trade;</b> &mdash; Get your own FREE home page
          today!
        </span>
      </div>
    </div>
  );
}

export default App;
