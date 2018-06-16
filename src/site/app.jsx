/* eslint-disable */
import React from 'react';
import Pagination from '../components/pagination/Pagination';

const App = () => (
    <div>
        <Pagination
            total={123}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
        />
    </div>

);
export default App;