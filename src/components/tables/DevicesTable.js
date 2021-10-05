import React, { useEffect } from 'react';
import { useTable, useFilters, useSortBy, usePagination } from 'react-table';
import restrictSpecialCharacters from '../helpers/string/restrictSpecialCharacters.js';
import { defaults } from '../../config/index';
import { useForm } from "react-hook-form";
import axios from 'axios';

function SelectColumnFilter({ column: { filterValue, setFilter, preFilteredRows, id } }) {

    const options = React.useMemo(() => {

        const options = new Set()

        preFilteredRows.forEach((row) => { options.add(row.values[id]) })
        return [...options.values()]

    }, [id, preFilteredRows])

    return (

        <select 
            className="devices-table-select-filter" 
            value={filterValue} 
            onChange={(e) => { 
                setFilter(e.target.value)
                localStorage.setItem('filter-setting', e.target.value)
            }}
        >
            <option value="">All</option>
            {options.map((option, i) => (<option key={i} value={option}>{option}</option>))}
        </select>
    )
}

function Table({ columns, data }) {
    
    if (!localStorage.getItem('filter-setting')) { localStorage.setItem('filter-setting', ""); }

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        state: { pageIndex },
    } = useTable({ 
        columns, 
        data,
        initialState: {
            filters: [{
                id: 'type',
                value: localStorage.getItem('filter-setting')
            }]
        }
    }, useFilters, useSortBy, usePagination)

    return (

        <div>
            <div className="devices-table-container" {...getTableProps()}>
                <div className="devices-table-header-container">
                    {headerGroups.map((headerGroup) => (
                        <div className="devices-table-filter-row-container" {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                <div className="devices-table-filter-container" {...column.getHeaderProps()}>
                                    <div className="devices-table-filter-title">{column.render('filterName')}</div>
                                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="devices-table-body-container" {...getTableBodyProps()}>
                    {page.map((row) => {
                        prepareRow(row)

                        return (
                            <div className="devices-table-row-container" {...row.getRowProps()}>
                                {row.cells.map((cell) => { return (<div {...cell.getCellProps()}>{cell.render('Cell')} </div>) })}
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="pagination-container">
                <div className="pagination-buttons-container">
                    <div className="pagination-button" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>{`<<`}</div>
                    <div className="pagination-button" onClick={() => previousPage()} disabled={!canPreviousPage}>{`<`}</div>
                    <div className="pagination-button" onClick={() => nextPage()} disabled={!canNextPage}>{`>`}</div>
                    <div className="pagination-button" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>{`>>`}</div>
                </div>
                <div className="pagination-info-container">
                    <div className="page-of-text">Page{' '}{pageIndex + 1} of {pageOptions.length}</div>
                </div>
            </div>
        </div>
    )
}

function DevicesTable(input) {

    const assignedSortSetting = input.tableSortSetting;
    const [devicesData, setDevicesData] = React.useState([]);
    const [showEditDevicePopup, setShowEditDevicePopup] = React.useState(false);
    const [showDeleteDevicePopup, setShowDeleteDevicePopup] = React.useState(false);
    const [editData, setEditData] = React.useState([]);
    const [deleteData, setDeleteData] = React.useState([]);

    useEffect(() => {

        const abortController = new AbortController();

            axios.get(defaults.deviceApiEndpoint).then(response => {

                const responseData = response.data.map(device => ({
                    id: device.id,
                    system_name: device.system_name,
                    type: device.type,
                    hdd_capacity: device.hdd_capacity,
                    edit_data: device,
                    delete_data: device
                }));

                
                setDevicesData(responseData)

            }).catch(error => {

                setDevicesData([])
                console.log(error);
            })
       
        return () => abortController.abort();

    }, []);

    const { register, handleSubmit } = useForm();

    const onUpdateSubmit = (data) => {

        axios.put(`${defaults.deviceApiEndpoint}/${editData.id}`, data).then(() => {

            setShowEditDevicePopup(false);
            setEditData([]);
            setTimeout(function () { window.location.reload() }, 100);
        });
    };

    const onDeleteSubmit = () => {

        axios.delete(`${defaults.deviceApiEndpoint}/${deleteData.id}`).then(() => {

            setShowDeleteDevicePopup(false);
            setDeleteData([]);
            setTimeout(function () { window.location.reload() }, 100);
        });
    };

    function editClickHandler(data) {

        if (showEditDevicePopup === false) {

            setEditData(data)
            setShowEditDevicePopup(true)
        }
    }

    function deleteClickHandler(data) {

        if (showDeleteDevicePopup === false) {

            setDeleteData(data)
            setShowDeleteDevicePopup(true)
        }
    }

    function handleEditDeleteShow() {

        if (showEditDevicePopup === true) {

            return (

                <div className="devices-table-add-edit-popup-container-overlay">
                    <div className="devices-table-add-edit-popup-container">
                        <div className="devices-table-add-edit-popup-container-top">
                            <div className="devices-table-add-edit-popup-closer" onClick={() => setShowEditDevicePopup(false)}>⤫</div>
                            <div className="devices-table-add-edit-popup-title">Edit Device</div>
                        </div>
                        <div className="devices-table-add-edit-popup-container-middle">
                            <div className="devices-table-add-edit-popup-container-device-details">
                                <div className="devices-table-add-edit-popup-details-title">Device Details:</div>
                                <div className="devices-table-add-edit-popup-container-device-details-values">
                                    <div className="devices-table-add-edit-popup-details-key">System Name:</div>
                                    <div className="devices-table-add-edit-popup-details-value">{editData.system_name}</div>
                                </div>
                                <div className="devices-table-add-edit-popup-container-device-details-values">
                                    <div className="devices-table-add-edit-popup-details-key">Type:</div>
                                    <div className="devices-table-add-edit-popup-details-value">{editData.type}</div>
                                </div>
                                <div className="devices-table-add-edit-popup-container-device-details-values">
                                    <div className="devices-table-add-edit-popup-details-key">HDD Capacity:</div>
                                    <div className="devices-table-add-edit-popup-details-value">{editData.hdd_capacity}GB</div>
                                </div>
                            </div>
                            <form className="devices-table-add-edit-popup-form-container" onSubmit={handleSubmit(onUpdateSubmit)}>
                                <div className="devices-table-add-edit-popup-form-input-container">
                                    <div className="devices-table-add-edit-devices-popup-input-title">System Name *</div>
                                    <input className="devices-table-add-edit-devices-popup-input-data" 
                                    
                                        {...register("system_name", { required: true })} 
                                        type="text"
                                        maxLength="50"
                                        onKeyPress={(e) => restrictSpecialCharacters(e)}
                                        defaultValue={editData.system_name}
                                    />
                                </div>
                                <div className="devices-table-add-edit-popup-form-input-container">
                                    <div className="devices-table-add-edit-devices-popup-input-title">Type *</div>
                                    <select className="devices-table-add-edit-devices-popup-input-select" defaultValue={editData.type} {...register("type", { required: true })}>
                                        <option value="">Select Type</option>
                                        <option value="Windows Workstation">Windows Workstation</option>
                                        <option value="Windows Server">Windows Server</option>
                                        <option value="Mac">Mac</option>
                                    </select>
                                </div>
                                <div className="devices-table-add-edit-popup-form-input-container">
                                    <div className="devices-table-add-edit-devices-popup-input-title">HDD Capacity (GB)*</div>
                                    <input className="devices-table-add-edit-devices-popup-input-data" 
                                        defaultValue={editData.hdd_capacity}
                                        min="0" 
                                        type="number" 
                                        {...register("hdd_capacity", { required: true })} 
                                        />
                                </div>
                                <div className="devices-table-add-edit-popup-container-bottom">
                                    <input className="devices-table-add-edit-popup-form-submit-button" type="submit" value="Save" />
                                    <div className="devices-table-add-edit-popup-form-close-button" onClick={() => setShowEditDevicePopup(false)}>Close</div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )
        }

        if (showDeleteDevicePopup === true) {

            return (

                <div className="devices-table-add-edit-popup-container-overlay">
                    <div className="devices-table-add-edit-popup-container">
                        <div className="devices-table-add-edit-popup-container-top">
                            <div className="devices-table-add-edit-popup-closer" onClick={() => setShowDeleteDevicePopup(false)}>⤫</div>
                            <div className="devices-table-add-edit-popup-title">Delete Device</div>
                        </div>
                        <div className="devices-table-add-edit-popup-container-middle">
                            <div className="devices-table-add-edit-popup-container-device-details">
                                <div className="devices-table-add-edit-popup-details-title">Device Details:</div>
                                <div className="devices-table-add-edit-popup-container-device-details-values">
                                    <div className="devices-table-add-edit-popup-details-key">System Name:</div>
                                    <div className="devices-table-add-edit-popup-details-value">{deleteData.system_name}</div>
                                </div>
                                <div className="devices-table-add-edit-popup-container-device-details-values">
                                    <div className="devices-table-add-edit-popup-details-key">Type:</div>
                                    <div className="devices-table-add-edit-popup-details-value">{deleteData.type}</div>
                                </div>
                                <div className="devices-table-add-edit-popup-container-device-details-values">
                                    <div className="devices-table-add-edit-popup-details-key">HDD Capacity:</div>
                                    <div className="devices-table-add-edit-popup-details-value">{deleteData.hdd_capacity}GB</div>
                                </div>
                            </div>
                            <div className="devices-table-add-edit-popup-confirm-text">Are you sure you wish to delete this device?</div>
                            <form className="devices-table-add-edit-popup-form-container" onSubmit={handleSubmit(onDeleteSubmit)}>
                                <div className="devices-table-add-edit-popup-container-bottom">
                                    <input className="devices-table-add-edit-popup-form-submit-button" type="submit" value="Confirm Delete" />
                                    <div className="devices-table-add-edit-popup-form-close-button" onClick={() => setShowDeleteDevicePopup(false)}>Close</div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )
        }
    }

    function sortData(sortType) {

        if (sortType === "STR") { return [...devicesData].sort((a, b) => a.system_name.localeCompare(b.system_name)); }
        if (sortType === "NUM") { return [...devicesData].sort((a, b) => parseInt(a.hdd_capacity) - parseInt(b.hdd_capacity)); }
    }

    function checkSortBy() {

        if (assignedSortSetting === "system_name") { 
            
            return <Table className="devices-table" columns={columns} data={sortData("STR")} /> 

        } else if (assignedSortSetting === "hdd_capacity") { 
            
            return <Table className="devices-table" columns={columns} data={sortData("NUM")} /> 

        } else { 
            
            return <Table className="devices-table" columns={columns} data={devicesData} />
        }
    }

    const columns = [
        {
            accessor: 'system_name',
            filterName: '',
            Filter: '',
            filter: '',
            Cell: (row) => <div className="devices-table-row-data-system-name">{row.value}</div>
        },
        {
            accessor: 'type',
            filterName: 'Device Type:',
            Filter: SelectColumnFilter,
            filter: 'includes',
            Cell: (row) => <div className="devices-table-row-data-type">{row.value}</div>
        },
        {
            accessor: 'hdd_capacity',
            filterName: '',
            Filter: '',
            filter: '',
            Cell: (row) => <div className="devices-table-row-data-hdd-capacity">{row.value}GB</div>
        },
        {
            accessor: 'edit_data',
            filterName: '',
            Filter: '',
            filter: '',
            Cell: (row) => <div className="devices-table-edit-device-button" onClick={() => editClickHandler(row.value)}>Edit</div>
        },
        {
            accessor: 'delete_data',
            filterName: '',
            Filter: '',
            filter: '',
            Cell: (row) => <div className="devices-table-delete-device-button" onClick={() => deleteClickHandler(row.value)}>Delete</div>
        }
    ];

    return (

        <div>
            {handleEditDeleteShow()}
            {checkSortBy()}
        </div>

    );
}

export default DevicesTable
