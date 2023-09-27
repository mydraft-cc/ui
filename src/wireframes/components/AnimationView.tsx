import * as React from "react";
import { Button } from 'antd';
import './AnimationView.scss';

// Default code
const code = '\\begin{document}\nHello world\n\\end{document}';

const addLineNumber = (event: any) => {
  const numberOfLines = event.target.value.split('\n').length;
  const lineNumbers = document.querySelector('.line-numbers') as HTMLDivElement

  lineNumbers.innerHTML = Array(numberOfLines)
    .fill('<span></span>')
    .join('')
}

const compileLatex = () => {
  const html = document.querySelector('.editor-diagram') as HTMLElement | null;

  if (html != null) {
    const tex = html.innerHTML;

    navigator.clipboard.writeText(tex).then(() => {
      alert('Success! Latex code copied to clipboard.');
    },() => {
      alert('Error! Failed to copy');
    });
  } else {
    alert('Error! Cannot perform action.');
  }
};

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
          <Button onClick={ compileLatex }>Compile LaTeX</Button>
        </div>
        <div className="code-editor">
          <div className="line-numbers">
              <span></span>
              <span></span>
              <span></span>
          </div>
          <textarea value={ code } onChange={ this.onCodeChange } onKeyUp={ addLineNumber } />
        </div>
      </div>
    );
  }
}

