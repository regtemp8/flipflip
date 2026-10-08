import * as React from "react";
import { Keyframes, animated } from "react-spring/renderprops";

const JiggleAnimation: any = Keyframes.Spring(
  async (next: any, cancel: any, props: any) => {
    const bounce = props.bounce;
    if (props.started) {
      await next({
        from: {
          transform: bounce
            ? "scale(1.0, 1.0) translate(0, 0)"
            : "scale(1.0, 1.0)",
        },
        transform: bounce
          ? "scale(1.1, 0.9) translate(0, -5px)"
          : "scale(1.1, 0.9)",
        config: { duration: bounce ? 80 : 100 },
      });
      await next({
        from: {
          transform: bounce
            ? "scale(1.1, 0.9) translate(0, -5px)"
            : "scale(1.1, 0.9)",
        },
        transform: bounce
          ? "scale(0.9, 1.1) translate(0, -5px)"
          : "scale(0.9, 1.1)",
        config: { duration: bounce ? 80 : 100 },
      });
      await next(
        {
          from: {
            transform: bounce
              ? "scale(0.9, 1.1) translate(0, -5px)"
              : "scale(0.9, 1.1)",
          },
          transform: bounce
            ? "scale(1.0, 1.0)  translate(0, 0)"
            : "scale(1.0, 1.0)",
          config: { duration: bounce ? 80 : 100 },
        },
        true,
      );
    } else {
      next(
        {
          from: {
            transform: "scale(1, 1)",
          },
        },
        true,
      );
    }
  },
);

interface JiggleProps {
  bounce?: boolean;
  id?: string;
  className?: string;
  style?: any;
  disable?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
}

interface JiggleState {
  hasStarted: boolean;
}

export default class Jiggle extends React.Component<JiggleProps, JiggleState> {
  constructor(props: JiggleProps) {
    super(props);

    this.state = {
      hasStarted: false,
    };
  }

  jiggle = () => {
    this.setState({
      hasStarted: true,
    });
  };

  stopJiggle = () => {
    this.setState({
      hasStarted: false,
    });
  };

  shouldComponentUpdate(props: JiggleProps, state: JiggleState): boolean {
    return (
      this.state.hasStarted !== state.hasStarted ||
      this.props.disable !== props.disable ||
      this.props.className !== props.className
    );
  }

  render() {
    if (this.props.disable) {
      return (
        <div
          className={this.props.className}
          style={this.props.style}
          onClick={this.props.onClick}
        >
          {this.props.children}
        </div>
      );
    } else {
      return (
        <JiggleAnimation
          reset
          native
          started={this.state.hasStarted}
          bounce={this.props.bounce ? this.props.bounce : false}
          onRest={this.stopJiggle}
        >
          {(props: any) => (
            <animated.div
              id={this.props.id}
              className={this.props.className}
              style={
                this.props.style ? { ...props, ...this.props.style } : props
              }
              onMouseEnter={this.jiggle}
              onClick={this.props.onClick}
            >
              {this.props.children}
            </animated.div>
          )}
        </JiggleAnimation>
      );
    }
  }
}

(Jiggle as any).displayName = "Jiggle";
