
var React = require('react/addons');
var Backend = require('../backend');
var inject = require('../backend/inject');
var compatInject = require('../backend/compat-inject');
var Store = require('./store');
var Bridge = require('../backend/bridge');
var makeWall = require('./wall');
var makeIframeWall = require('./iframe-wall');

class Harness extends React.Component {
  componentWillMount() {
    this.storeBridge = new Bridge();
    this.store = new Store(this.storeBridge);
  }

  getChildContext() {
    return {
      store: this.store,
    };
  }

  componentDidMount() {
    var iframe = React.findDOMNode(this.iframe)

    var wall = makeIframeWall(window, iframe.contentWindow);
    this.storeBridge.attach(wall.parent);

    var backBridge = new Bridge();
    backBridge.attach(wall.child);
    this.backend = new Backend(backBridge, iframe.contentWindow);

    window.addEventListener('keydown', this.store.onKeyDown.bind(this.store));
    window.backend = this.backend

    var win = iframe.contentWindow
    var doc = iframe.contentDocument
    inject(this.backend, win, true);
    compatInject(win);
    var script = doc.createElement('script');
    script.src = this.props.targetSrc
    doc.head.appendChild(script);
  }

  render() {
    var backend = this.backend
    return <div style={styles.harness}>
      <div style={styles.top}>
        <iframe style={styles.iframe} ref={n => this.iframe = n} />
      </div>
      <div style={styles.bottom}>
        {React.addons.cloneWithProps(this.props.children)}
      </div>
    </div>
  }
}

Harness.childContextTypes = {
  store: React.PropTypes.object,
};

var styles = {
  harness: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  bottom: {
    height: 400,
    display: 'flex',
  },

  top: {
    flex: 1,
    flexDirection: 'column',
    display: 'flex',
  },

  iframe: {
    border: '5px solid magenta',
    height: '400px',
    flex: 1,
  },

  iframeTitle: {
    margin: 0,
    textAlign: 'center',
    fontFamily: 'sans-serif',
  },
}

module.exports = Harness
