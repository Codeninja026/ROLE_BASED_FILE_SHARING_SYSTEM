package com.vento.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@Configuration
public class DatabaseInitializer {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @PostConstruct
    public void initialize() {
        System.out.println("=== Starting vento Database Initializer ===");
        
        // Extract host and database name from URL
        // Example: jdbc:postgresql://localhost:5432/sharevault_db
        String baseUrl = dbUrl.substring(0, dbUrl.lastIndexOf("/"));
        String dbName = dbUrl.substring(dbUrl.lastIndexOf("/") + 1);
        
        // Connect to the default 'postgres' database first
        String postgresUrl = baseUrl + "/postgres";

        try (Connection conn = DriverManager.getConnection(postgresUrl, username, password)) {
            System.out.println("Checking existence of database: " + dbName);
            
            try (Statement stmt = conn.createStatement()) {
                ResultSet rs = stmt.executeQuery("SELECT 1 FROM pg_database WHERE datname = '" + dbName + "'");
                
                if (!rs.next()) {
                    System.out.println("Database " + dbName + " does not exist. Creating it now...");
                    stmt.executeUpdate("CREATE DATABASE " + dbName);
                    System.out.println("Database " + dbName + " created successfully!");
                } else {
                    System.out.println("Database " + dbName + " already exists. Connecting...");
                }
            }

            refreshRoleConstraint(baseUrl + "/" + dbName);
            refreshTeamConstraints(baseUrl + "/" + dbName);
        } catch (Exception e) {
            System.err.println("Critical error during vento database initialization: " + e.getMessage());
            // We don't throw exception here to allow Spring to attempt standard connectivity
            // which might provide better error messages if it's a password issue.
        }
        System.out.println("=== vento Database Initializer Finished ===");
    }

    private void refreshRoleConstraint(String targetDbUrl) {
        try (Connection conn = DriverManager.getConnection(targetDbUrl, username, password);
             Statement stmt = conn.createStatement()) {

            ResultSet tableExists = stmt.executeQuery(
                    "SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public'");

            if (!tableExists.next()) {
                System.out.println("Users table not found yet. Skipping role constraint refresh.");
                return;
            }

            stmt.executeUpdate("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            stmt.executeUpdate(
                    "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER'))");

            System.out.println("Updated users_role_check constraint for ADMIN, MANAGER, and USER roles.");
        } catch (Exception e) {
            System.err.println("Unable to refresh users_role_check constraint: " + e.getMessage());
        }
    }

    private void refreshTeamConstraints(String targetDbUrl) {
        try (Connection conn = DriverManager.getConnection(targetDbUrl, username, password);
             Statement stmt = conn.createStatement()) {

            ResultSet tableExists = stmt.executeQuery(
                    "SELECT 1 FROM information_schema.tables WHERE table_name = 'teams' AND table_schema = 'public'");

            if (!tableExists.next()) {
                System.out.println("Teams table not found yet. Skipping team constraint refresh.");
                return;
            }

            stmt.executeUpdate("ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_manager_id_key");
            stmt.executeUpdate("ALTER TABLE teams DROP CONSTRAINT IF EXISTS uk_team_manager");
            stmt.executeUpdate("ALTER TABLE teams DROP CONSTRAINT IF EXISTS idx_team_manager");
            stmt.executeUpdate("DROP INDEX IF EXISTS idx_team_manager");
            stmt.executeUpdate("CREATE INDEX IF NOT EXISTS idx_team_manager ON teams(manager_id)");

            System.out.println("Updated teams.manager_id index for multi-team managers.");
        } catch (Exception e) {
            System.err.println("Unable to refresh team manager constraints: " + e.getMessage());
        }
    }
}
