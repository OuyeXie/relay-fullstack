/* Replace with your SQL commands */

CREATE TABLE property ( id INTEGER PRIMARY KEY ASC,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        last_asked_price DOUBLE,
                        last_sold_price DOUBLE,
                        appoximate_area_price DOUBLE,
                        residual_value DOUBLE,
                        last_sold_time TIMESTAMP,
                        last_update_time TIMESTAMP,
                        mortgage DOUBLE,
                        tax DOUBLE,
                        strda DOUBLE,
                        year_built INTEGER,
                        tax_built INTEGER,
                        size DOUBLE,
                        walkscore DOUBLE,
                        days_on_market DOUBLE,
                        type TEXT,
                        mls TEXT,
                        address TEXT,
                        info TEXT,
                        url TEXT,
                        source TEXT,
                        liked BOOLEAN DEFAULT FALSE);
CREATE INDEX property_last_asked_price ON property(last_asked_price);
