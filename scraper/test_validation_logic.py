from scraper import validate_tune_data

def test_validation():
    # Test 1: Good data
    good_data = {
        "title": "Good Tune",
        "content": "X:1\nK:G\nABC"
    }
    assert validate_tune_data(good_data) == True, "Good data failed"
    print("Test 1 Passed: Good data")

    # Test 2: Missing title
    bad_data_1 = {
        "title": "",
        "content": "X:1\nK:G\nABC"
    }
    assert validate_tune_data(bad_data_1) == False, "Missing title failed"
    print("Test 2 Passed: Missing title")

    # Test 3: Unknown title
    bad_data_2 = {
        "title": "Unknown",
        "content": "X:1\nK:G\nABC"
    }
    assert validate_tune_data(bad_data_2) == False, "Unknown title failed"
    print("Test 3 Passed: Unknown title")

    # Test 4: Short title
    bad_data_3 = {
        "title": "A",
        "content": "X:1\nK:G\nABC"
    }
    assert validate_tune_data(bad_data_3) == False, "Short title failed"
    print("Test 4 Passed: Short title")

    # Test 5: Missing X:
    bad_data_4 = {
        "title": "Bad Content",
        "content": "K:G\nABC"
    }
    assert validate_tune_data(bad_data_4) == False, "Missing X: failed"
    print("Test 5 Passed: Missing X:")

    # Test 6: Missing K:
    bad_data_5 = {
        "title": "Bad Content",
        "content": "X:1\nABC"
    }
    assert validate_tune_data(bad_data_5) == False, "Missing K: failed"
    print("Test 6 Passed: Missing K:")
    
    # Test 7: Headers only (User Example 1)
    bad_data_6 = {
        "title": "100 Popular Hornpipes",
        "content": "X: 0\nT: 100 Popular Hornpipes\nK:"
    }
    assert validate_tune_data(bad_data_6) == False, "Headers only (empty K) failed to be rejected"
    print("Test 7 Passed: Rejected headers only (empty K)")

    # Test 8: Headers only (User Example 2)
    bad_data_7 = {
        "title": "Frankie Oneill",
        "content": "X:12103\nT:FRANKIE ONEILL\nK:C"
    }
    assert validate_tune_data(bad_data_7) == False, "Headers only (K:C) failed to be rejected"
    print("Test 8 Passed: Rejected headers only (K:C)" )

    # Test 9: Exact user bad example
    bad_data_8 = {
        "title": "100 Popular Hornpipes",
        "content": """X: 0
T: 100 Popular Hornpipes, Reels, Jigs and Country Dances
Z: 2014 John Chambers <jc:trillian.mit.edu>
B: Jean White "100 Popular Hornpipes, Reels, Jigs and Country Dances", Boston 1880
F: http://www.loc.gov/item/sm1880.09124/
F: http://URL
K:"""
    }
    assert validate_tune_data(bad_data_8) == False, "User Example 1 failed to be rejected"
    print("Test 9 Passed: user bad example 1")

    print("All validation tests passed!")

if __name__ == "__main__":
    test_validation()
