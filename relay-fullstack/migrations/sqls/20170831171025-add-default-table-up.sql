/* Replace with your SQL commands */

CREATE TABLE property ( id INTEGER PRIMARY KEY ASC,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        last_asked_price DOUBLE,
                        last_sold_price DOUBLE,
                        residual_value DOUBLE,
                        last_sold_time DOUBLE,
                        postcode TEXT,
                        info TEXT);
CREATE INDEX property_postcode ON property(postcode);
