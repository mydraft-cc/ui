import * as React from "react";
import { Button } from 'antd';
import './AnimationView.scss';

// default code
const code = 'Hello, world!';

export class AnimationView extends React.Component {
  state = { code };

  onCodeChange = ({ target: { value }}: any) => {
    this.setState({ code: value });
  };

  render() {
    const { code } = this.state;
    return (
      <div className="animation-view">
        <div className="title-editor">
          <h4>Animation panel</h4>
          <Button>Compile</Button>
        </div>
        <div className="code-editor">
          <textarea value={ code } rows={ 8 } onChange={ this.onCodeChange } />
        </div>
      </div>
    );
  }
}
