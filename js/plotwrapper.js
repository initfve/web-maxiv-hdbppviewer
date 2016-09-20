import React from "react";
import {findDOMNode} from "react-dom";
import {connect} from "react-redux";

import {ImagePlot} from "./imageplot";
import {setTimeRange, fetchArchiveData} from "./actions";


class PlotWrapper extends React.Component {

    /* This is a "dummy" react component which acts as an adapter for
       the Plot, which is based on D3. This may or may not be a good
       way to do it, but at least it's relatively simple. */

    constructor () {
        super();
        this.state = {
            timeRange: [new Date(Date.now() - 24*3600e3),
                        new Date(Date.now())]
        }
    }
    
    componentDidMount () {
        // create the SVG plot immediately, once
        let container = findDOMNode(this.refs.plot);
        this.plot = new ImagePlot(container, this.state.timeRange,
                                  this.onChange.bind(this));
    }

    componentWillReceiveProps (props) {
        // update the plot as needed
        if (props.attributes != this.props.attributes) {
            this.plot.runChangeCallback()
        }
        if (props.data != this.props.data) {
            this.plot.setData(props.data);
        }
        if (props.config != this.props.config) {
            this.plot.setConfig(props.config)
        }
        if (props.descriptions != this.props.descriptions) {
            this.plot.setDescriptions(props.descriptions);
        }
        const [oldStart, oldEnd] = this.state.timeRange,
              {start, end} = props.timeRange;
        // to avoid double updates, we check if the time scale has actually changed
        if (oldStart != start || oldEnd != end) {
            this.setState({timeRange: [start, end]})            
            this.plot.setTimeRange([start, end]);
        }
        if (props.axes != this.props.axes) {
            Object.keys(props.axes).forEach(axis => {
                this.plot.setYAxisScale(axis, props.axes[axis].scale);
            })
        }
    }

    shouldComponentUpdate () {
        // we never want to re-render the component; all updates
        // happen in the plot
        return false
    }
    
    render() {
        return <div className="plot-wrapper" ref="plot"></div>
    }

    onChange (start, end, width, height) {
        // callback from the plot
        this.setState({timeRange: [start, end]})
        this.props.dispatch(setTimeRange(start, end));
        this.props.dispatch(fetchArchiveData(start, end, width, height));
    }
    
}

const mapStateToProps = (state) => {
    return {
        attributes: state.attributes,
        data: state.archiveData,
        config: state.config,
        descriptions: state.descriptions,
        timeRange: state.timeRange,
        config: state.attributeConfig,
        axes: state.axisConfiguration
    }
}


export default connect(mapStateToProps)(PlotWrapper);
