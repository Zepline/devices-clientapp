import { Component } from 'react';
import { render, cleanup, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderer from 'react-test-renderer';
import { defaults } from '../config/index';
import logo from '../imgs/logo.png';
import DevicesTable from './DevicesTableUnit.test.js';
import restrictSpecialCharacters from '../components/helpers/string/restrictSpecialCharacters.js';
import axios from 'axios';

afterEach(cleanup);

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tableSortSetting: this.props.sortSetting,
      showAddDevicePopup: false,
      system_name: '',
      type: '',
      hdd_capacity: ''
    }

    this.changeHandler = this.changeHandler.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
  }

  changeHandler = (e) => {

    this.setState({ [e.target.id]: e.target.value });
  }

  submitHandler(e) {

    e.preventDefault();

    if (this.state.system_name.length !== 0) {

      if (defaults.types.includes(this.state.type)) {

        if (this.state.hdd_capacity >= 0 && !isNaN(this.state.hdd_capacity)) {

          const payload = {
            system_name: this.state.system_name,
            type: this.state.type,
            hdd_capacity: this.state.hdd_capacity
          }

          axios.post(defaults.deviceApiEndpoint, payload).then(() => {

            this.setState({
              showAddDevicePopup: false,
              systemName: '',
              type: '',
              hddCapacity: ''
            })

            setTimeout(function () { window.location.reload() }, 100);
          });
        }
      }
    }
  }

  updateTableSortSetting(event) {

    this.setState({ tableSortSetting: event.target.value });
  }

  showAddDevicePopup() {

    if (this.state.showAddDevicePopup === true) {

      return (

        <div data-testid="add-device-popup" className="devices-table-add-edit-popup-container-overlay">
          <div className="devices-table-add-edit-popup-container">
            <div className="devices-table-add-edit-popup-container-top">
              <div className="devices-table-add-edit-popup-closer" onClick={() => this.setState({ showAddDevicePopup: false })}>⤫</div>
              <div className="devices-table-add-edit-popup-title">Add Device</div>
            </div>
            <div className="devices-table-add-edit-popup-container-middle">
              <form className="devices-table-add-edit-popup-form-container" onSubmit={this.submitHandler}>
                <div className="devices-table-add-edit-popup-form-input-container">
                  <div className="devices-table-add-edit-devices-popup-input-title">System Name *</div>
                  <input className="devices-table-add-edit-devices-popup-input-data"
                    data-testid="system-name-input"
                    id="system_name"
                    type="text"
                    maxLength="50"
                    onKeyPress={(e) => restrictSpecialCharacters(e)}
                    value={this.state.system_name}
                    onChange={this.changeHandler}
                    required
                  />
                </div>
                <div className="devices-table-add-edit-popup-form-input-container">
                  <div className="devices-table-add-edit-devices-popup-input-title">Type *</div>
                  <select data-testid="type-input-form" className="devices-table-add-edit-devices-popup-input-select" id="type" value={this.state.type} onChange={this.changeHandler} required>
                    <option value="">Select Type</option>
                    <option value="Windows Workstation">Windows Workstation</option>
                    <option value="Windows Server">Windows Server</option>
                    <option value="Mac">Mac</option>
                  </select>
                </div>
                <div className="devices-table-add-edit-popup-form-input-container">
                  <div className="devices-table-add-edit-devices-popup-input-title">HDD Capacity (GB)*</div>
                  <input className="devices-table-add-edit-devices-popup-input-data"
                    data-testid="hdd-capacity-input"
                    id="hdd_capacity"
                    type="number"
                    min="0"
                    value={this.state.hdd_capacity}
                    onChange={this.changeHandler}
                    required
                  />
                </div>
                <div className="devices-table-add-edit-popup-container-bottom">
                  <input data-testid="submit-add-button" className="devices-table-add-edit-popup-form-submit-button" type="submit" value="Save" />
                  <div className="devices-table-add-edit-popup-form-close-button" onClick={() => this.setState({ showAddDevicePopup: false })}>Close</div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )
    }
  }

  refreshDevicesTable() {

    return <DevicesTable tableSortSetting={this.state.tableSortSetting} />
  }

  render() {

    return (
      <div data-testid="root-container" className="root-container">
        <div className="sidebar-container"><img className="sidebar-icon-img" src={logo} alt="" /></div>
        <div className="App">
          <div className="devices-table-add-device-button-container">
            <div data-testid="add-device-button" className="devices-table-add-device-button" onClick={() => this.setState({ showAddDevicePopup: true })}>＋ Add Device</div>
          </div>
          <div className="devices-table-sort-by-container">
            <div className="devices-table-sort-filter-title">Sort by:</div>
            <select data-testid="select-sort-by-dropdown" className="devices-table-select-sort-filter" onChange={(setting) => this.updateTableSortSetting(setting)}>
              <option value="">None</option>
              <option value="system_name">System Name</option>
              <option value="hdd_capacity">HDD Capacity</option>
            </select>
          </div>
          {this.showAddDevicePopup()}
          {this.refreshDevicesTable()}
        </div>
      </div>
    )
  }
}

describe('Renders the App class component', () => {

  it("renders page without crashing", () => {

    render(<App />);
  })

  it("matches the snapshot", () => {

    const treeObject = renderer.create(<App />).toJSON();
    expect(treeObject).toMatchSnapshot();
  })
});

describe('Tests different components within the App class component', () => {

  it("clicks the add button and renders the add device popup", () => {

    render(<App />);

    userEvent.click(screen.getByTestId("add-device-button"));
    expect(screen.getByTestId("add-device-popup")).toBeInTheDocument();
  })

  it("selects the sortBy dropwdown option system name", () => {

    render(<App />);

    fireEvent.change(screen.getByTestId("select-sort-by-dropdown"), { target: { value: 'system_name' } })
    expect(screen.getByTestId("select-sort-by-dropdown")).toHaveTextContent("System Name");

    fireEvent.change(screen.getByTestId("select-sort-by-dropdown"), { target: { value: 'system_name' } })
    expect(screen.getByTestId("select-sort-by-dropdown")).toHaveTextContent("System Name");
  })

  it("selects the sortBy option hdd capacity", () => {

    render(<App />);

    fireEvent.change(screen.getByTestId("select-sort-by-dropdown"), { target: { value: 'hdd_capacity' } })
    expect(screen.getByTestId("select-sort-by-dropdown")).toHaveTextContent("HDD Capacity");
  })
});