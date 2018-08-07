'use strict';

const {h, render, Component} = require('preact');

class Section extends Component {
  render() {
    const {className, title, content} = this.props;
    
    return (
      <section className={"flex pa3 pa5-l" + (className ? " " + className : "")}>
        <div className="w-100 w-70-l ml-auto bl-l b--light-grey">
          <h2 className="section__title mv0 pt3 pt0-l pb3 pl4-l f2 fw4 bb b--light-grey">{title}</h2>
          {content}
        </div>
      </section>
    );
  }
}

module.exports = Section;