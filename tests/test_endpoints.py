#!/usr/bin/env python3
"""
Test script for all API endpoints
"""
import requests
import json
from typing import Dict, Any
import os

# Base URL for the API
BASE_URL = "http://192.168.68.89:8000"

# API Token - can be set via environment variable
API_TOKEN = os.getenv('API_TOKEN', 'LmdbWbDuvLm0i1sWotGlnKOgrJ2Naj2AMPAwKMI62CgKtJDi7LXeSFpOcOoH4H0mX2OjyDsqq6tDebrjcVT14lKrhWFniHrD3Kyh7LMtITUgN1CU6Htm6Pa9JX5apRTG')

# Headers with authentication
HEADERS = {
    'X-API-Token': API_TOKEN
}

def print_result(endpoint: str, response: requests.Response) -> None:
    """Pretty print the result of an API call"""
    print(f"\n{'='*80}")
    print(f"Endpoint: {endpoint}")
    print(f"Status Code: {response.status_code}")
    print(f"Response Time: {response.elapsed.total_seconds():.3f}s")
    
    if response.status_code == 200:
        try:
            data = response.json()
            if isinstance(data, list):
                print(f"Result: List with {len(data)} items")
                if data:
                    print(f"First item: {json.dumps(data[0], indent=2, default=str)[:200]}...")
            elif isinstance(data, dict):
                print(f"Result: {json.dumps(data, indent=2, default=str)[:500]}")
            else:
                print(f"Result: {data}")
        except Exception as e:
            print(f"Response (raw): {response.text[:500]}")
    else:
        print(f"Error: {response.text[:500]}")
    print('='*80)

def test_endpoints():
    """Test all API endpoints"""
    
    print("Starting API endpoint tests...")
    print(f"Base URL: {BASE_URL}")
    
    # Health and monitoring endpoints
    endpoints = [
        ("GET", "/health", "Health check"),
        ("GET", "/readyz", "Readiness check"),
        ("GET", "/metrics", "Prometheus metrics"),
    ]
    
    # Core data endpoints
    endpoints.extend([
        ("GET", "/standings", "League standings"),
        ("GET", "/weeklyTable", "Weekly standings table"),
        ("GET", "/players", "All players"),
        ("GET", "/teams", "All teams"),
        ("GET", "/fixtures", "All fixtures"),
        ("GET", "/completedFixtures", "Completed fixtures"),
        ("GET", "/upcomingFixtures", "Upcoming fixtures"),
        ("GET", "/upcomingGameweek", "Next gameweek number"),
    ])
    
    # Parametrized endpoints (will need actual IDs from data)
    param_endpoints = [
        ("GET", "/playersById/{id}", "Player by ID"),
        ("GET", "/playersByTeam/{id}", "Players by team ID"),
        ("GET", "/teamsById/{id}", "Team by ID"),
        ("GET", "/fixturesById/{id}", "Fixture by ID"),
        ("GET", "/completedGamebyId/{id}", "Completed game by ID"),
        ("GET", "/upcomingFixturesbyID/{id}", "Upcoming fixture by ID"),
    ]
    
    # Debug endpoints
    endpoints.extend([
        ("GET", "/debug/geo", "Geo debug endpoint"),
    ])
    
    results = {"success": 0, "failed": 0, "total": 0}
    
    # Test basic endpoints
    for method, endpoint, description in endpoints:
        results["total"] += 1
        try:
            url = f"{BASE_URL}{endpoint}"
            response = requests.get(url, headers=HEADERS, timeout=5)
            print_result(f"{method} {endpoint} - {description}", response)
            
            if response.status_code == 200:
                results["success"] += 1
            else:
                results["failed"] += 1
        except Exception as e:
            results["failed"] += 1
            print(f"\n{'='*80}")
            print(f"Endpoint: {endpoint}")
            print(f"Error: {str(e)}")
            print('='*80)
    
    # Get sample IDs for parametrized endpoints
    sample_ids = {}
    
    try:
        # Get a sample player ID
        response = requests.get(f"{BASE_URL}/players", headers=HEADERS, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                sample_ids['player_id'] = data[0].get('player_id')
    except:
        pass
    
    try:
        # Get a sample team ID from teams endpoint
        response = requests.get(f"{BASE_URL}/teams", headers=HEADERS, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                sample_ids['team_id'] = data[0].get('team_id')
    except:
        pass
    
    try:
        # Get a sample fixture ID (and fallback team_id if not found above)
        response = requests.get(f"{BASE_URL}/fixtures", headers=HEADERS, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                sample_ids['fixture_id'] = data[0].get('match_id')
                # Use fixture's home_team_id as fallback if team_id not found
                if not sample_ids.get('team_id'):
                    sample_ids['team_id'] = data[0].get('home_team_id') or data[0].get('away_team_id')
    except:
        pass
    
    try:
        # Get a sample completed game ID
        response = requests.get(f"{BASE_URL}/completedFixtures", headers=HEADERS, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                sample_ids['match_id'] = data[0].get('match_id')
    except:
        pass
    
    print(f"\n\nFound sample IDs: {sample_ids}")
    
    # Test parametrized endpoints with sample data
    if sample_ids:
        print("\n\nTesting parametrized endpoints with sample data...")
        
        param_tests = [
            ("/playersById/{id}", "player_id"),
            ("/playersByTeam/{id}", "team_id"),
            ("/teamsById/{id}", "team_id"),
            ("/fixturesById/{id}", "fixture_id"),
            ("/completedGamebyId/{id}", "match_id"),
            ("/upcomingFixturesbyID/{id}", "fixture_id"),
        ]
        
        for endpoint_template, id_key in param_tests:
            if id_key in sample_ids and sample_ids[id_key]:
                results["total"] += 1
                try:
                    endpoint = endpoint_template.replace("{id}", str(sample_ids[id_key]))
                    url = f"{BASE_URL}{endpoint}"
                    response = requests.get(url, headers=HEADERS, timeout=5)
                    print_result(f"GET {endpoint}", response)
                    
                    if response.status_code == 200:
                        results["success"] += 1
                    else:
                        results["failed"] += 1
                except Exception as e:
                    results["failed"] += 1
                    print(f"\n{'='*80}")
                    print(f"Endpoint: {endpoint}")
                    print(f"Error: {str(e)}")
                    print('='*80)
            else:
                print(f"\nSkipping {endpoint_template} - no sample {id_key} available")
    
    # Print summary
    print(f"\n\n{'='*80}")
    print("TEST SUMMARY")
    print('='*80)
    print(f"Total endpoints tested: {results['total']}")
    print(f"Successful: {results['success']}")
    print(f"Failed: {results['failed']}")
    print(f"Success rate: {(results['success']/results['total']*100):.1f}%")
    print('='*80)

if __name__ == "__main__":
    test_endpoints()
