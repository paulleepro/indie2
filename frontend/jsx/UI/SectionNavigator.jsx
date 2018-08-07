'use strict';

const {h, render, Component} = require('preact');

class SectionNavigator extends Component {
  componentDidMount() {
    $(window).on("scroll", (e) => {
      const $stickee = $(".sectionNavigator"),
            thresh = $("body").height() - window.innerHeight - 50;

      if (window.scrollY > thresh && $stickee.hasClass("fixed")) {
        $stickee.css("top", "18rem");
      } else {
        $stickee.css("top", "25.5rem");
      }
    });
  }

  render() {
    const {sections, selectedSection, onSelected, bottomContent} = this.props;

    return (
      <div className="sectionNavigator fixed pl5">
        <div className="sectionNavigator--inner dn dib-l">
          {sections.map((section, i) => {
            if (section.hide) return null;
            
            return (
              <span 
                key={i}
                className={"sectionNavigator__item db mb3 pv1 ttu black fw5 f7 pointer dim" + (selectedSection === i ? " pl2 sectionNavigator__item--selected" : " pl3")}
                onClick={() => onSelected(i)}
              >
                {section.label}
              </span>
            );
          })}
          {bottomContent}
        </div>
      </div>
    );
  }
}

module.exports = SectionNavigator;