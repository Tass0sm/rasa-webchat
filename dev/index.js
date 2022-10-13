import React, {
  forwardRef,
  useRef,
  useEffect,
  useImperativeHandle
} from "react";
import ReactDOM from "react-dom/client";
import PropTypes from "prop-types";
import { Widget } from "../index.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

export const rasaWebchatProTypes = {
  initPayload: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  protocol: PropTypes.string,
  socketUrl: PropTypes.string.isRequired,
  socketPath: PropTypes.string,
  protocolOptions: PropTypes.shape({}),
  customData: PropTypes.shape({}),
  handleNewUserMessage: PropTypes.func,
  profileAvatar: PropTypes.string,
  inputTextFieldHint: PropTypes.string,
  connectingText: PropTypes.string,
  showCloseButton: PropTypes.bool,
  showFullScreenButton: PropTypes.bool,
  hideWhenNotConnected: PropTypes.bool,
  connectOn: PropTypes.oneOf(["mount", "open"]),
  autoClearCache: PropTypes.bool,
  onSocketEvent: PropTypes.objectOf(PropTypes.func),
  fullScreenMode: PropTypes.bool,
  badge: PropTypes.number,
  embedded: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  params: PropTypes.object,
  openLauncherImage: PropTypes.string,
  closeImage: PropTypes.string,
  docViewer: PropTypes.bool,
  customComponent: PropTypes.func,
  displayUnreadCount: PropTypes.bool,
  showMessageDate: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  customMessageDelay: PropTypes.func,
  tooltipPayload: PropTypes.string,
  tooltipDelay: PropTypes.number,
  withRules: PropTypes.bool,
  rules: PropTypes.arrayOf(
    PropTypes.shape({
      payload: PropTypes.string.isRequired,
      text: PropTypes.string,
      trigger: PropTypes.shape({
        url: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.arrayOf(PropTypes.string)
        ]),
        timeOnPage: PropTypes.number,
        numberOfVisits: PropTypes.number,
        numberOfPageVisits: PropTypes.number,
        device: PropTypes.string,
        when: PropTypes.oneOf(["always", "init"]),
        queryString: PropTypes.arrayOf(
          PropTypes.shape({
            param: PropTypes.string,
            value: PropTypes.string,
            sendAsEntity: PropTypes.bool
          })
        ),
        eventListeners: PropTypes.arrayOf(
          PropTypes.shape({
            selector: PropTypes.string.isRequired,
            event: PropTypes.string.isRequired
          })
        )
      })
    })
  ),
  triggerEventListenerUpdateRate: PropTypes.number
};

export const rasaWebchatProDefaultTypes = {
  title: "Welcome",
  customData: {},
  inputTextFieldHint: "Type a message...",
  connectingText: "Waiting for server...",
  fullScreenMode: false,
  hideWhenNotConnected: true,
  autoClearCache: false,
  connectOn: "mount",
  onSocketEvent: {},
  protocol: "socketio",
  socketUrl: "http://localhost",
  protocolOptions: {},
  badge: 0,
  embedded: false,
  params: {
    storage: "local"
  },
  docViewer: false,
  showCloseButton: true,
  showFullScreenButton: false,
  displayUnreadCount: false,
  showMessageDate: false,
  customMessageDelay: message => {
    let delay = message.length * 30;
    if (delay > 3 * 1000) delay = 3 * 1000;
    if (delay < 800) delay = 800;
    return delay;
  },
  tooltipPayload: null,
  tooltipDelay: 500,
  withRules: true,
  rules: null,
  triggerEventListenerUpdateRate: 500
};

const RasaWebchatPro = React.memo(
  forwardRef((props, ref) => {
    const widget = useRef(null);

    const updateRules = newRules => {
      if (newRules && widget && widget.current.sendMessage) {
        const handler =
          (window[RULES_HANDLER_SINGLETON] &&
            window[RULES_HANDLER_SINGLETON].updateRules(newRules)) ||
          new RulesHandler(
            newRules,
            widget.current.sendMessage,
            props.triggerEventListenerUpdateRate
          );
        handler.initHandler();
        // putting it in the window object lets us do the singleton design pattern
        window[RULES_HANDLER_SINGLETON] = handler;
      }
    };

    useEffect(
      () =>
        function cleanUp() {
          const handler = window[RULES_HANDLER_SINGLETON];
          if (handler && handler instanceof RulesHandler) {
            handler.cleanUp(true);
          }
        },
      []
    );

    useImperativeHandle(ref, () => ({
      sendMessage: (...args) => {
        widget.current.sendMessage(...args);
      },
      updateRules: rules => {
        updateRules(rules);
      },
      getSessionId: widget.current.getSessionId
    }));

    return <Widget ref={widget} {...{ ...props }} />;
  })
);

RasaWebchatPro.propTypes = rasaWebchatProTypes;

RasaWebchatPro.defaultProps = rasaWebchatProDefaultTypes;

class RasaWebchatProWithRules extends React.Component {
  constructor(props) {
    super(props);
    const { connectOn } = props;
    let { withRules } = props;
    if (connectOn === "open" && withRules === true) {
      throw new Error(
        "You can't use rules and connect on open, you have to use connect on mount"
      );
    }
    this.webchatRef = null;
    if (withRules === undefined) {
      withRules = true;
    }
    this.state = {
      propsRetrieved: !withRules,
      rulesApplied: !withRules
    };
    this.setRef = this.setRef.bind(this);
    this.handleSessionConfirm = this.handleSessionConfirm.bind(this);
  }

  setRef(element) {
    const { innerRef } = this.props;
    if (!innerRef) {
      this.webchatRef = element;
    } else if (
      innerRef &&
      innerRef.constructor &&
      innerRef.call &&
      innerRef.apply
    ) {
      // if this is true, innerRef is a function and thus it's a callback ref
      this.webchatRef = element;
      innerRef(element);
    } else {
      innerRef.current = element;
    }
  }

  handleSessionConfirm(sessionObject) {
    const { innerRef } = this.props;
    this.setState({
      // The OR makes it work even without the augmented webchat channel
      propsRetrieved: { ...sessionObject.props }
    });
    if (
      ((innerRef && innerRef.current) || this.webchatRef.updateRules) &&
      sessionObject.props &&
      sessionObject.props.rules
    ) {
      setTimeout(() => {
        if (innerRef && innerRef.current) {
          innerRef.current.updateRules(sessionObject.props.rules);
        } else {
          this.webchatRef.updateRules(sessionObject.props.rules);
        }
      }, 100);
      this.setState({ rulesApplied: true });
    }
  }

  render() {
    const { onSocketEvent } = this.props;
    let { withRules } = this.props;
    if (withRules === undefined) {
      withRules = true;
    }
    const { propsRetrieved } = this.state;
    let propsToApply = {};
    if (propsRetrieved) propsToApply = propsRetrieved;
    delete propsToApply.rules;
    return (
      <div
        style={{ display: propsRetrieved ? undefined : "none" }}
        className={
          this.props.embedded || (propsToApply && propsToApply.embedded)
            ? "rw-pro-widget-embedded"
            : ""
        }
      >
        <RasaWebchatPro
          ref={this.setRef}
          {...{
            ...propsToApply,
            ...this.props
          }}
          onSocketEvent={
            withRules
              ? {
                  session_confirm: this.handleSessionConfirm,
                  ...onSocketEvent
                }
              : {
                  ...onSocketEvent
                }
          }
        />
      </div>
    );
  }
}

RasaWebchatProWithRules.propTypes = {
  ...rasaWebchatProTypes,
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.object })
  ])
};

export default React.forwardRef((props, ref) => (
  <RasaWebchatProWithRules innerRef={ref} {...props} />
));

export const selfMount = (props, element = null) => {
  const load = () => {
    if (element === null) {
      const node = document.createElement("div");
      node.setAttribute("id", "rasaWebchatPro");
      document.body.appendChild(node);
    }
    const webchatPro = React.createElement(RasaWebchatProWithRules, props);
    root.render(webchatPro);
  };
  if (document.readyState === "complete") {
    load();
  } else {
    window.addEventListener("load", () => {
      load();
    });
  }
};

root.render(
  <RasaWebchatProWithRules
    initPayload={"/get_started"}
    socketUrl={"http://localhost:5005"}
    socketPath={"/socket.io/"}
    customData={{ language: "en" }} // arbitrary custom data. Stay minimal as this will be added to the socket
    title={"The SmartChef"}
  />
);

// console.log(root);
