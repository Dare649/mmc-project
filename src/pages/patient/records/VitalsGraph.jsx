import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2'; // Make sure to install 'react-chartjs-2' and 'chart.js'
import { axiosClient } from '../../../axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const VitalsGraph = () => {
    const [activeTab, setActiveTab] = useState('food'); // Default tab is food
    const [loading, setLoading] = useState(false);
    const MySwal = withReactContent(Swal);

    const [foodData, setFoodData] = useState([]);
    const [bloodPressureData, setBloodPressureData] = useState([]);
    const [bloodSugarData, setBloodSugarData] = useState([]);
    const [weightData, setWeightData] = useState([]);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [duration, setDuration] = useState(''); // Default duration is empty

    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('en-GB').replace(/\//g, '-');
    };

    useEffect(() => {
        if (startDate && endDate && duration) {  // Ensuring all fields are filled before API call
            const fetchData = async () => {
                try {
                    setLoading(true);

                    const foodResponse = await axiosClient.get(`/api/patient/rm/get_vitals/food_log`, {
                        params: {
                            start_date: formatDate(startDate),
                            end_date: formatDate(endDate),
                            duration: duration
                        }
                    });
                    const bpResponse = await axiosClient.get(`/api/patient/rm/get_vitals/blood_pressure`, {
                        params: {
                            start_date: formatDate(startDate),
                            end_date: formatDate(endDate),
                            duration: duration
                        }
                    });
                    const sugarResponse = await axiosClient.get(`/api/patient/rm/get_vitals/blood_sugar`, {
                        params: {
                            start_date: formatDate(startDate),
                            end_date: formatDate(endDate),
                            duration: duration
                        }
                    });
                    const weightResponse = await axiosClient.get(`/api/patient/rm/get_vitals/weight`, {
                        params: {
                            start_date: formatDate(startDate),
                            end_date: formatDate(endDate),
                            duration: duration
                        }
                    });

                    setFoodData(foodResponse.data.data || []);
                    setBloodPressureData(bpResponse.data.data || []);
                    setBloodSugarData(sugarResponse.data.data || []);
                    setWeightData(weightResponse.data.data || []);

                } catch (error) {
                    MySwal.fire({
                        title: "Error",
                        icon: "error",
                        text: "An error occurred fetching vitals, try again later."
                    });
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [startDate, endDate, duration]);  // Only call API if all dependencies are set

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const getChartData = () => {
        switch (activeTab) {
            case 'food':
                return {
                    labels: foodData.map(item => item.date),
                    datasets: [
                        {
                            label: 'Food (lbs)',
                            data: foodData.map(item => item.reading_in_lbs || item.reading_in_unit),
                            borderColor: '#0058E6',
                            fill: false
                        }
                    ]
                };
            case 'blood_pressure':
                return {
                    labels: bloodPressureData.map(item => item.date),
                    datasets: [
                        {
                            label: 'Systolic',
                            data: bloodPressureData.map(item => item.systolic),
                            borderColor: '#FF5733',
                            fill: false
                        },
                        {
                            label: 'Diastolic',
                            data: bloodPressureData.map(item => item.diastolic),
                            borderColor: '#33FF57',
                            fill: false
                        }
                    ]
                };
            case 'blood_sugar':
                return {
                    labels: bloodSugarData.map(item => item.date),
                    datasets: [
                        {
                            label: 'Blood Sugar (mmol)',
                            data: bloodSugarData.map(item => item.reading_in_mmol),
                            borderColor: '#FFC300',
                            fill: false
                        },
                        {
                            label: 'Blood Sugar (mg/dl)',
                            data: bloodSugarData.map(item => item.reading_in_mgdl),
                            borderColor: '#DAF7A6',
                            fill: false
                        }
                    ]
                };
            case 'weight':
                return {
                    labels: weightData.map(item => item.date),
                    datasets: [
                        {
                            label: 'Weight (lbs)',
                            data: weightData.map(item => item.reading_in_lbs || item.reading_in_unit),
                            borderColor: '#FF33A1',
                            fill: false
                        }
                    ]
                };
            default:
                return { labels: [], datasets: [] };
        }
    };

    const chartData = getChartData();

    return (
        <div className="w-full">
            <div className=" sm:w-full lg:w-[50%">
                <div className="flex lg:flex-row sm:flex-col items-center p-4 gap-2 w-full">
                    {/* Dropdown for selecting duration */}
                    <select 
                        value={duration} 
                        onChange={(e) => setDuration(e.target.value)} 
                        className="p-2 border rounded w-full"
                    >
                        <option value="">--Select Duration--</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                    <div className='w-full flex items-center gap-x-2'>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            className="p-2 border rounded"
                            dateFormat="dd-MM-yyyy"
                            placeholderText="Select start date"
                        />
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            className="p-2 border rounded"
                            dateFormat="dd-MM-yyyy"
                            placeholderText="Select end date"
                        />
                    </div>
                </div>

                <div className="lg:p-4 sm:p-2 w-full">
                    {loading ? (
                        <div>Loading...</div>
                    ) : chartData.labels.length > 0 ? (
                        <Line
                            data={chartData}
                            options={{
                                responsive: true,
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Date'
                                        }
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: 'Reading'
                                        }
                                    }
                                }
                            }}
                            className='w-full'
                        />
                    ) : (
                        <div className='text-primary-100 font-bold capitalize text-center'>No data available</div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-center space-x-0 rounded-t-lg w-full">
                    {['food', 'blood_pressure', 'blood_sugar', 'weight'].map((type, index) => (
                        <button
                            key={index}
                            onClick={() => handleTabClick(type)}
                            className={`sm:p-2 lg:p-2 capitalize font-bold text-lg ${
                                activeTab === type ? 'text-primary-100' : 'text-neutral-50'
                            }`}
                        >
                            {type.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
};

export default VitalsGraph;
