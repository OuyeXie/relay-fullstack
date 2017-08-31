/* Replace with your SQL commands */

CREATE TABLE statistics ( id INTEGER PRIMARY KEY ASC,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          last_ask_price DOUBLE,
                          last_sold_price DOUBLE,
                          residual_value DOUBLE,
                          last_sold_time DOUBLE,
                          postcode TEXT,
                          info TEXT)
